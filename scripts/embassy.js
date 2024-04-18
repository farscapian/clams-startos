// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

function saferStringify(x) {
    try {
        return JSON.stringify(x);
    } catch (e) {
        return "" + x;
    }
}
class AnyParser {
    description;
    constructor(description = {
        name: "Any",
        children: [],
        extras: []
    }){
        this.description = description;
    }
    parse(a, onParse) {
        return onParse.parsed(a);
    }
}
class ArrayParser {
    description;
    constructor(description = {
        name: "Array",
        children: [],
        extras: []
    }){
        this.description = description;
    }
    parse(a, onParse) {
        if (Array.isArray(a)) return onParse.parsed(a);
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this
        });
    }
}
class BoolParser {
    description;
    constructor(description = {
        name: "Boolean",
        children: [],
        extras: []
    }){
        this.description = description;
    }
    parse(a, onParse) {
        if (a === true || a === false) return onParse.parsed(a);
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this
        });
    }
}
const isObject = (x)=>typeof x === "object" && x != null;
const isFunctionTest = (x)=>typeof x === "function";
const isNumber = (x)=>typeof x === "number";
const isString = (x)=>typeof x === "string";
const booleanOnParse = {
    parsed (_) {
        return true;
    },
    invalid (_) {
        return false;
    }
};
class FunctionParser {
    description;
    constructor(description = {
        name: "Function",
        children: [],
        extras: []
    }){
        this.description = description;
    }
    parse(a, onParse) {
        if (isFunctionTest(a)) return onParse.parsed(a);
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this
        });
    }
}
class NilParser {
    description;
    constructor(description = {
        name: "Null",
        children: [],
        extras: []
    }){
        this.description = description;
    }
    parse(a, onParse) {
        if (a === null || a === undefined) return onParse.parsed(a);
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this
        });
    }
}
class ObjectParser {
    description;
    constructor(description = {
        name: "Object",
        children: [],
        extras: []
    }){
        this.description = description;
    }
    parse(a, onParse) {
        if (isObject(a)) return onParse.parsed(a);
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this
        });
    }
}
class StringParser {
    description;
    constructor(description = {
        name: "String",
        children: [],
        extras: []
    }){
        this.description = description;
    }
    parse(a, onParse) {
        if (isString(a)) return onParse.parsed(a);
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this
        });
    }
}
class UnknownParser {
    description;
    constructor(description = {
        name: "Unknown",
        children: [],
        extras: []
    }){
        this.description = description;
    }
    parse(a, onParse) {
        return onParse.parsed(a);
    }
}
class ConcatParsers {
    parent;
    otherParser;
    description;
    constructor(parent, otherParser, description = {
        name: "Concat",
        children: [
            parent,
            otherParser
        ],
        extras: []
    }){
        this.parent = parent;
        this.otherParser = otherParser;
        this.description = description;
    }
    static of(parent, otherParser) {
        if (parent.unwrappedParser().description.name === "Any") {
            return otherParser;
        }
        if (otherParser.unwrappedParser().description.name === "Any") {
            return parent;
        }
        return new ConcatParsers(parent, otherParser);
    }
    parse(a, onParse) {
        const parent = this.parent.enumParsed(a);
        if ("error" in parent) {
            return onParse.invalid(parent.error);
        }
        const other = this.otherParser.enumParsed(parent.value);
        if ("error" in other) {
            return onParse.invalid(other.error);
        }
        return onParse.parsed(other.value);
    }
}
class DefaultParser {
    parent;
    defaultValue;
    description;
    constructor(parent, defaultValue, description = {
        name: "Default",
        children: [
            parent
        ],
        extras: [
            defaultValue
        ]
    }){
        this.parent = parent;
        this.defaultValue = defaultValue;
        this.description = description;
    }
    parse(a, onParse) {
        const parser = this;
        const defaultValue = this.defaultValue;
        if (a == null) {
            return onParse.parsed(defaultValue);
        }
        const parentCheck = this.parent.enumParsed(a);
        if ("error" in parentCheck) {
            parentCheck.error.parser = parser;
            return onParse.invalid(parentCheck.error);
        }
        return onParse.parsed(parentCheck.value);
    }
}
class GuardParser {
    checkIsA;
    typeName;
    description;
    constructor(checkIsA, typeName, description = {
        name: "Guard",
        children: [],
        extras: [
            typeName
        ]
    }){
        this.checkIsA = checkIsA;
        this.typeName = typeName;
        this.description = description;
    }
    parse(a, onParse) {
        if (this.checkIsA(a)) {
            return onParse.parsed(a);
        }
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this
        });
    }
}
class MappedAParser {
    parent;
    map;
    mappingName;
    description;
    constructor(parent, map, mappingName = map.name, description = {
        name: "Mapped",
        children: [
            parent
        ],
        extras: [
            mappingName
        ]
    }){
        this.parent = parent;
        this.map = map;
        this.mappingName = mappingName;
        this.description = description;
    }
    parse(a, onParse) {
        const map = this.map;
        const result = this.parent.enumParsed(a);
        if ("error" in result) {
            return onParse.invalid(result.error);
        }
        return onParse.parsed(map(result.value));
    }
}
class MaybeParser {
    parent;
    description;
    constructor(parent, description = {
        name: "Maybe",
        children: [
            parent
        ],
        extras: []
    }){
        this.parent = parent;
        this.description = description;
    }
    parse(a, onParse) {
        if (a == null) {
            return onParse.parsed(null);
        }
        const parser = this;
        const parentState = this.parent.enumParsed(a);
        if ("error" in parentState) {
            const { error } = parentState;
            error.parser = parser;
            return onParse.invalid(error);
        }
        return onParse.parsed(parentState.value);
    }
}
class OrParsers {
    parent;
    otherParser;
    description;
    constructor(parent, otherParser, description = {
        name: "Or",
        children: [
            parent,
            otherParser
        ],
        extras: []
    }){
        this.parent = parent;
        this.otherParser = otherParser;
        this.description = description;
    }
    parse(a, onParse) {
        const parser = this;
        const parent = this.parent.enumParsed(a);
        if ("value" in parent) {
            return onParse.parsed(parent.value);
        }
        const other = this.otherParser.enumParsed(a);
        if ("error" in other) {
            const { error } = other;
            error.parser = parser;
            return onParse.invalid(error);
        }
        return onParse.parsed(other.value);
    }
}
class NumberParser {
    description;
    constructor(description = {
        name: "Number",
        children: [],
        extras: []
    }){
        this.description = description;
    }
    parse(a, onParse) {
        if (isNumber(a)) return onParse.parsed(a);
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this
        });
    }
}
function unwrapParser(a) {
    if (a instanceof Parser) return unwrapParser(a.parser);
    return a;
}
const enumParsed = {
    parsed (value) {
        return {
            value
        };
    },
    invalid (error) {
        return {
            error
        };
    }
};
class Parser {
    parser;
    description;
    _TYPE;
    constructor(parser, description = {
        name: "Wrapper",
        children: [
            parser
        ],
        extras: []
    }){
        this.parser = parser;
        this.description = description;
        this._TYPE = null;
        this.parse = (a, onParse)=>{
            return this.parser.parse(a, onParse);
        };
        this.unsafeCast = (value)=>{
            const state = this.enumParsed(value);
            if ("value" in state) return state.value;
            const { error } = state;
            throw new TypeError(`Failed type: ${Parser.validatorErrorAsString(error)} given input ${saferStringify(value)}`);
        };
        this.castPromise = (value)=>{
            const state = this.enumParsed(value);
            if ("value" in state) return Promise.resolve(state.value);
            const { error } = state;
            return Promise.reject(new TypeError(`Failed type: ${Parser.validatorErrorAsString(error)} given input ${saferStringify(value)}`));
        };
        this.errorMessage = (input)=>{
            const parsed = this.parse(input, enumParsed);
            if ("value" in parsed) return;
            return Parser.validatorErrorAsString(parsed.error);
        };
        this.map = (fn, mappingName)=>{
            return new Parser(new MappedAParser(this, fn, mappingName));
        };
        this.concat = (otherParser)=>{
            return new Parser(ConcatParsers.of(this, new Parser(otherParser)));
        };
        this.orParser = (otherParser)=>{
            return new Parser(new OrParsers(this, new Parser(otherParser)));
        };
        this.test = (value)=>{
            return this.parse(value, booleanOnParse);
        };
        this.optional = (_name)=>{
            return new Parser(new MaybeParser(this));
        };
        this.defaultTo = (defaultValue)=>{
            return new Parser(new DefaultParser(new Parser(new MaybeParser(this)), defaultValue));
        };
        this.validate = (isValid, otherName)=>{
            return new Parser(ConcatParsers.of(this, new Parser(new GuardParser(isValid, otherName))));
        };
        this.refine = (refinementTest, otherName = refinementTest.name)=>{
            return new Parser(ConcatParsers.of(this, new Parser(new GuardParser(refinementTest, otherName))));
        };
        this.rename = (nameString)=>{
            return parserName(nameString, this);
        };
        this.enumParsed = (value)=>{
            return this.parse(value, enumParsed);
        };
        this.unwrappedParser = ()=>{
            let answer = this;
            while(true){
                const next = answer.parser;
                if (next instanceof Parser) {
                    answer = next;
                } else {
                    return next;
                }
            }
        };
    }
    parse;
    static isA(checkIsA, name) {
        return new Parser(new GuardParser(checkIsA, name));
    }
    static validatorErrorAsString = (error)=>{
        const { parser, value, keys } = error;
        const keysString = !keys.length ? "" : keys.map((x)=>`[${x}]`).reverse().join("");
        return `${keysString}${Parser.parserAsString(parser)}(${saferStringify(value)})`;
    };
    static parserAsString(parserComingIn) {
        const parser = unwrapParser(parserComingIn);
        const { description: { name, extras, children } } = parser;
        if (parser instanceof ShapeParser) {
            return `${name}<{${parser.description.children.map((subParser, i)=>`${String(parser.description.extras[i]) || "?"}:${Parser.parserAsString(subParser)}`).join(",")}}>`;
        }
        if (parser instanceof OrParsers) {
            const parent = unwrapParser(parser.parent);
            const parentString = Parser.parserAsString(parent);
            if (parent instanceof OrParsers) return parentString;
            return `${name}<${parentString},...>`;
        }
        if (parser instanceof GuardParser) {
            return String(extras[0] || name);
        }
        if (parser instanceof StringParser || parser instanceof ObjectParser || parser instanceof NumberParser || parser instanceof BoolParser || parser instanceof AnyParser) {
            return name.toLowerCase();
        }
        if (parser instanceof FunctionParser) {
            return name;
        }
        if (parser instanceof NilParser) {
            return "null";
        }
        if (parser instanceof ArrayParser) {
            return "Array<unknown>";
        }
        const specifiers = [
            ...extras.map(saferStringify),
            ...children.map(Parser.parserAsString)
        ];
        const specifiersString = `<${specifiers.join(",")}>`;
        return `${name}${specifiersString}`;
    }
    unsafeCast;
    castPromise;
    errorMessage;
    map;
    concat;
    orParser;
    test;
    optional;
    defaultTo;
    validate;
    refine;
    rename;
    enumParsed;
    unwrappedParser;
}
function guard(test, testName) {
    return Parser.isA(test, testName || test.name);
}
const any = new Parser(new AnyParser());
class ArrayOfParser {
    parser;
    description;
    constructor(parser, description = {
        name: "ArrayOf",
        children: [
            parser
        ],
        extras: []
    }){
        this.parser = parser;
        this.description = description;
    }
    parse(a, onParse) {
        if (!Array.isArray(a)) {
            return onParse.invalid({
                value: a,
                keys: [],
                parser: this
            });
        }
        const values = [
            ...a
        ];
        for(let index = 0; index < values.length; index++){
            const result = this.parser.enumParsed(values[index]);
            if ("error" in result) {
                result.error.keys.push("" + index);
                return onParse.invalid(result.error);
            } else {
                values[index] = result.value;
            }
        }
        return onParse.parsed(values);
    }
}
function arrayOf(validator) {
    return new Parser(new ArrayOfParser(validator));
}
const unknown = new Parser(new UnknownParser());
const number = new Parser(new NumberParser());
const isNill = new Parser(new NilParser());
const natural = number.refine((x)=>x >= 0 && x === Math.floor(x));
const isFunction = new Parser(new FunctionParser());
const __boolean = new Parser(new BoolParser());
class DeferredParser {
    description;
    parser;
    static create() {
        return new DeferredParser();
    }
    constructor(description = {
        name: "Deferred",
        children: [],
        extras: []
    }){
        this.description = description;
    }
    setParser(parser) {
        this.parser = new Parser(parser);
        return this;
    }
    parse(a, onParse) {
        if (!this.parser) {
            return onParse.invalid({
                value: "Not Set Up",
                keys: [],
                parser: this
            });
        }
        return this.parser.parse(a, onParse);
    }
}
function deferred() {
    const deferred = DeferredParser.create();
    function setParser(parser) {
        deferred.setParser(parser);
    }
    return [
        new Parser(deferred),
        setParser
    ];
}
function every(...parsers) {
    const filteredParsers = parsers.filter((x)=>x !== any);
    if (filteredParsers.length <= 0) {
        return any;
    }
    const first = filteredParsers.splice(0, 1)[0];
    return filteredParsers.reduce((left, right)=>{
        return left.concat(right);
    }, first);
}
class ShapeParser {
    parserMap;
    isPartial;
    parserKeys;
    description;
    constructor(parserMap, isPartial, parserKeys = Object.keys(parserMap), description = {
        name: isPartial ? "Partial" : "Shape",
        children: parserKeys.map((key)=>parserMap[key]),
        extras: parserKeys
    }){
        this.parserMap = parserMap;
        this.isPartial = isPartial;
        this.parserKeys = parserKeys;
        this.description = description;
    }
    parse(a, onParse) {
        const parser = this;
        if (!object.test(a)) {
            return onParse.invalid({
                value: a,
                keys: [],
                parser
            });
        }
        const { parserMap, isPartial } = this;
        const value = {
            ...a
        };
        if (Array.isArray(a)) {
            value.length = a.length;
        }
        for(const key in parserMap){
            if (key in value) {
                const parser = parserMap[key];
                const state = parser.enumParsed(a[key]);
                if ("error" in state) {
                    const { error } = state;
                    error.keys.push(saferStringify(key));
                    return onParse.invalid(error);
                }
                const smallValue = state.value;
                value[key] = smallValue;
            } else if (!isPartial) {
                return onParse.invalid({
                    value: "missingProperty",
                    parser,
                    keys: [
                        saferStringify(key)
                    ]
                });
            }
        }
        return onParse.parsed(value);
    }
}
const isPartial = (testShape)=>{
    return new Parser(new ShapeParser(testShape, true));
};
const partial = isPartial;
const isShape = (testShape)=>{
    return new Parser(new ShapeParser(testShape, false));
};
function shape(testShape, optionals, optionalAndDefaults) {
    if (optionals) {
        const defaults = optionalAndDefaults || {};
        const entries = Object.entries(testShape);
        const optionalSet = new Set(Array.from(optionals));
        return every(partial(Object.fromEntries(entries.filter(([key, _])=>optionalSet.has(key)).map(([key, parser])=>[
                key,
                parser.optional()
            ]))), isShape(Object.fromEntries(entries.filter(([key, _])=>!optionalSet.has(key))))).map((ret)=>{
            for (const key of optionalSet){
                const keyAny = key;
                if (!(keyAny in ret) && keyAny in defaults) {
                    ret[keyAny] = defaults[keyAny];
                }
            }
            return ret;
        });
    }
    return isShape(testShape);
}
const objectMatcher = new Parser(new ObjectParser());
const object = Object.assign(function objectOf(...args) {
    return shape(...args);
}, objectMatcher);
class DictionaryParser {
    parsers;
    description;
    constructor(parsers, description = {
        name: "Dictionary",
        children: parsers.reduce((acc, [k, v])=>{
            acc.push(k, v);
            return acc;
        }, []),
        extras: []
    }){
        this.parsers = parsers;
        this.description = description;
    }
    parse(a, onParse) {
        const { parsers } = this;
        const parser = this;
        const entries = Object.entries(a);
        for (const entry of entries){
            const [key, value] = entry;
            const found = findOrError(parsers, key, value, parser);
            if (found == undefined) return onParse.parsed(a);
            if ("error" in found) return onParse.invalid(found.error);
            entry[0] = found[0].value;
            entry[1] = found[1].value;
        }
        const answer = Object.fromEntries(entries);
        return onParse.parsed(answer);
    }
}
const dictionary = (...parsers)=>{
    return object.concat(new DictionaryParser([
        ...parsers
    ]));
};
const isArray = new Parser(new ArrayParser());
const string = new Parser(new StringParser());
const instanceOf = (classCreator)=>guard((x)=>x instanceof classCreator, `is${classCreator.name}`);
class LiteralsParser {
    values;
    description;
    constructor(values, description = {
        name: "Literal",
        children: [],
        extras: values
    }){
        this.values = values;
        this.description = description;
    }
    parse(a, onParse) {
        if (this.values.indexOf(a) >= 0) {
            return onParse.parsed(a);
        }
        return onParse.invalid({
            value: a,
            keys: [],
            parser: this
        });
    }
}
function literal(isEqualToValue) {
    return new Parser(new LiteralsParser([
        isEqualToValue
    ]));
}
function literals(firstValue, ...restValues) {
    return new Parser(new LiteralsParser([
        firstValue,
        ...restValues
    ]));
}
class RecursiveParser {
    recursive;
    description;
    parser;
    static create(fn) {
        const parser = new RecursiveParser(fn);
        parser.parser = fn(new Parser(parser));
        return parser;
    }
    constructor(recursive, description = {
        name: "Recursive",
        children: [],
        extras: [
            recursive
        ]
    }){
        this.recursive = recursive;
        this.description = description;
    }
    parse(a, onParse) {
        if (!this.parser) {
            return onParse.invalid({
                value: "Recursive Invalid State",
                keys: [],
                parser: this
            });
        }
        return this.parser.parse(a, onParse);
    }
}
function recursive(fn) {
    fn(any);
    const created = RecursiveParser.create(fn);
    return new Parser(created);
}
const regex = (tester)=>string.refine(function(x) {
        return tester.test(x);
    }, tester.toString());
function some(...parsers) {
    if (parsers.length <= 0) {
        return any;
    }
    const first = parsers.splice(0, 1)[0];
    return parsers.reduce((left, right)=>left.orParser(right), first);
}
class TupleParser {
    parsers;
    lengthMatcher;
    description;
    constructor(parsers, lengthMatcher = literal(parsers.length), description = {
        name: "Tuple",
        children: parsers,
        extras: []
    }){
        this.parsers = parsers;
        this.lengthMatcher = lengthMatcher;
        this.description = description;
    }
    parse(input, onParse) {
        const tupleError = isArray.enumParsed(input);
        if ("error" in tupleError) return onParse.invalid(tupleError.error);
        const values = input;
        const stateCheck = this.lengthMatcher.enumParsed(values.length);
        if ("error" in stateCheck) {
            stateCheck.error.keys.push(saferStringify("length"));
            return onParse.invalid(stateCheck.error);
        }
        const answer = new Array(this.parsers.length);
        for(const key in this.parsers){
            const parser = this.parsers[key];
            const value = values[key];
            const result = parser.enumParsed(value);
            if ("error" in result) {
                const { error } = result;
                error.keys.push(saferStringify(key));
                return onParse.invalid(error);
            }
            answer[key] = result.value;
        }
        return onParse.parsed(answer);
    }
}
function tuple(...parsers) {
    return new Parser(new TupleParser(parsers));
}
class NamedParser {
    parent;
    name;
    description;
    constructor(parent, name, description = {
        name: "Named",
        children: [
            parent
        ],
        extras: [
            name
        ]
    }){
        this.parent = parent;
        this.name = name;
        this.description = description;
    }
    parse(a, onParse) {
        const parser = this;
        const parent = this.parent.enumParsed(a);
        if ("error" in parent) {
            const { error } = parent;
            error.parser = parser;
            return onParse.invalid(error);
        }
        return onParse.parsed(parent.value);
    }
}
function findOrError(parsers, key, value, parser) {
    let foundError;
    for (const [keyParser, valueParser] of parsers){
        const enumState = keyParser.enumParsed(key);
        const valueState = valueParser.enumParsed(value);
        if ("error" in enumState) {
            if (!foundError) {
                const { error } = enumState;
                error.parser = parser;
                error.keys.push("" + key);
                foundError = {
                    error
                };
            }
            continue;
        }
        const newKey = enumState.value;
        if ("error" in valueState) {
            if (!foundError) {
                const { error } = valueState;
                error.keys.push("" + newKey);
                foundError = {
                    error
                };
            }
            continue;
        }
        return [
            enumState,
            valueState
        ];
    }
    return foundError;
}
function parserName(name, parent) {
    return new Parser(new NamedParser(parent, name));
}
class Matched {
    value;
    constructor(value){
        this.value = value;
        this.when = (..._args)=>{
            return this;
        };
        this.unwrap = ()=>{
            return this.value;
        };
    }
    when;
    defaultTo(_defaultValue) {
        return this.value;
    }
    defaultToLazy(_getValue) {
        return this.value;
    }
    unwrap;
}
class MatchMore {
    a;
    constructor(a){
        this.a = a;
        this.when = (...args)=>{
            const [outcome, ...matchers] = args.reverse();
            const me = this;
            const parser = matches.some(...matchers.map((matcher)=>matcher instanceof Parser ? matcher : literal(matcher)));
            const result = parser.enumParsed(this.a);
            if ("error" in result) {
                return me;
            }
            const { value } = result;
            if (outcome instanceof Function) {
                return new Matched(outcome(value));
            }
            return new Matched(outcome);
        };
        this.unwrap = ()=>{
            throw new Error("Expecting that value is matched");
        };
    }
    when;
    defaultTo(value) {
        return value;
    }
    defaultToLazy(getValue) {
        return getValue();
    }
    unwrap;
}
const array = Object.assign(function arrayOfWrapper(...args) {
    return arrayOf(...args);
}, isArray);
const matches = Object.assign(function matchesFn(value) {
    return new MatchMore(value);
}, {
    array,
    arrayOf,
    some,
    tuple,
    regex,
    number,
    natural,
    isFunction,
    object,
    string,
    shape,
    partial,
    literal,
    every,
    guard,
    unknown,
    any,
    boolean: __boolean,
    dictionary,
    literals,
    nill: isNill,
    instanceOf,
    Parse: Parser,
    parserName,
    recursive,
    deferred
});
const mod = {
    AnyParser: AnyParser,
    ArrayParser: ArrayParser,
    BoolParser: BoolParser,
    FunctionParser: FunctionParser,
    GuardParser: GuardParser,
    NilParser: NilParser,
    NumberParser: NumberParser,
    ObjectParser: ObjectParser,
    OrParsers: OrParsers,
    ShapeParser: ShapeParser,
    StringParser: StringParser,
    saferStringify: saferStringify,
    NamedParser: NamedParser,
    ArrayOfParser: ArrayOfParser,
    LiteralsParser: LiteralsParser,
    ConcatParsers: ConcatParsers,
    MappedAParser: MappedAParser,
    default: matches,
    Validator: Parser,
    matches,
    allOf: every,
    any,
    anyOf: some,
    array,
    arrayOf,
    boolean: __boolean,
    deferred,
    dictionary,
    every,
    guard,
    instanceOf,
    isFunction,
    literal,
    literals,
    natural,
    nill: isNill,
    number,
    object,
    oneOf: some,
    Parse: Parser,
    Parser,
    parserName,
    partial,
    recursive,
    regex,
    shape,
    some,
    string,
    tuple,
    unknown
};
class YAMLError extends Error {
    mark;
    constructor(message = "(unknown reason)", mark = ""){
        super(`${message} ${mark}`);
        this.mark = mark;
        this.name = this.constructor.name;
    }
    toString(_compact) {
        return `${this.name}: ${this.message} ${this.mark}`;
    }
}
function isBoolean(value) {
    return typeof value === "boolean" || value instanceof Boolean;
}
function isNegativeZero(i) {
    return i === 0 && Number.NEGATIVE_INFINITY === 1 / i;
}
function compileList(schema, name, result) {
    const exclude = [];
    for (const includedSchema of schema.include){
        result = compileList(includedSchema, name, result);
    }
    for (const currentType of schema[name]){
        for(let previousIndex = 0; previousIndex < result.length; previousIndex++){
            const previousType = result[previousIndex];
            if (previousType.tag === currentType.tag && previousType.kind === currentType.kind) {
                exclude.push(previousIndex);
            }
        }
        result.push(currentType);
    }
    return result.filter((_type, index)=>!exclude.includes(index));
}
function compileMap(...typesList) {
    const result = {
        fallback: {},
        mapping: {},
        scalar: {},
        sequence: {}
    };
    for (const types of typesList){
        for (const type of types){
            if (type.kind !== null) {
                result[type.kind][type.tag] = result["fallback"][type.tag] = type;
            }
        }
    }
    return result;
}
class Schema {
    static SCHEMA_DEFAULT;
    implicit;
    explicit;
    include;
    compiledImplicit;
    compiledExplicit;
    compiledTypeMap;
    constructor(definition){
        this.explicit = definition.explicit || [];
        this.implicit = definition.implicit || [];
        this.include = definition.include || [];
        for (const type of this.implicit){
            if (type.loadKind && type.loadKind !== "scalar") {
                throw new YAMLError("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
            }
        }
        this.compiledImplicit = compileList(this, "implicit", []);
        this.compiledExplicit = compileList(this, "explicit", []);
        this.compiledTypeMap = compileMap(this.compiledImplicit, this.compiledExplicit);
    }
    extend(definition) {
        return new Schema({
            implicit: [
                ...new Set([
                    ...this.implicit,
                    ...definition?.implicit ?? []
                ])
            ],
            explicit: [
                ...new Set([
                    ...this.explicit,
                    ...definition?.explicit ?? []
                ])
            ],
            include: [
                ...new Set([
                    ...this.include,
                    ...definition?.include ?? []
                ])
            ]
        });
    }
    static create() {}
}
const DEFAULT_RESOLVE = ()=>true;
const DEFAULT_CONSTRUCT = (data)=>data;
function checkTagFormat(tag) {
    return tag;
}
class Type {
    tag;
    kind = null;
    instanceOf;
    predicate;
    represent;
    defaultStyle;
    styleAliases;
    loadKind;
    constructor(tag, options){
        this.tag = checkTagFormat(tag);
        if (options) {
            this.kind = options.kind;
            this.resolve = options.resolve || DEFAULT_RESOLVE;
            this.construct = options.construct || DEFAULT_CONSTRUCT;
            this.instanceOf = options.instanceOf;
            this.predicate = options.predicate;
            this.represent = options.represent;
            this.defaultStyle = options.defaultStyle;
            this.styleAliases = options.styleAliases;
        }
    }
    resolve = ()=>true;
    construct = (data)=>data;
}
class DenoStdInternalError extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
}
function copy(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
const MIN_READ = 32 * 1024;
const MAX_SIZE = 2 ** 32 - 2;
class Buffer {
    #buf;
    #off = 0;
    constructor(ab){
        this.#buf = ab === undefined ? new Uint8Array(0) : new Uint8Array(ab);
    }
    bytes(options = {
        copy: true
    }) {
        if (options.copy === false) return this.#buf.subarray(this.#off);
        return this.#buf.slice(this.#off);
    }
    empty() {
        return this.#buf.byteLength <= this.#off;
    }
    get length() {
        return this.#buf.byteLength - this.#off;
    }
    get capacity() {
        return this.#buf.buffer.byteLength;
    }
    truncate(n) {
        if (n === 0) {
            this.reset();
            return;
        }
        if (n < 0 || n > this.length) {
            throw Error("bytes.Buffer: truncation out of range");
        }
        this.#reslice(this.#off + n);
    }
    reset() {
        this.#reslice(0);
        this.#off = 0;
    }
    #tryGrowByReslice(n) {
        const l = this.#buf.byteLength;
        if (n <= this.capacity - l) {
            this.#reslice(l + n);
            return l;
        }
        return -1;
    }
    #reslice(len) {
        assert(len <= this.#buf.buffer.byteLength);
        this.#buf = new Uint8Array(this.#buf.buffer, 0, len);
    }
    readSync(p) {
        if (this.empty()) {
            this.reset();
            if (p.byteLength === 0) {
                return 0;
            }
            return null;
        }
        const nread = copy(this.#buf.subarray(this.#off), p);
        this.#off += nread;
        return nread;
    }
    read(p) {
        const rr = this.readSync(p);
        return Promise.resolve(rr);
    }
    writeSync(p) {
        const m = this.#grow(p.byteLength);
        return copy(p, this.#buf, m);
    }
    write(p) {
        const n = this.writeSync(p);
        return Promise.resolve(n);
    }
    #grow(n) {
        const m = this.length;
        if (m === 0 && this.#off !== 0) {
            this.reset();
        }
        const i = this.#tryGrowByReslice(n);
        if (i >= 0) {
            return i;
        }
        const c = this.capacity;
        if (n <= Math.floor(c / 2) - m) {
            copy(this.#buf.subarray(this.#off), this.#buf);
        } else if (c + n > MAX_SIZE) {
            throw new Error("The buffer cannot be grown beyond the maximum size.");
        } else {
            const buf = new Uint8Array(Math.min(2 * c + n, MAX_SIZE));
            copy(this.#buf.subarray(this.#off), buf);
            this.#buf = buf;
        }
        this.#off = 0;
        this.#reslice(Math.min(m + n, MAX_SIZE));
        return m;
    }
    grow(n) {
        if (n < 0) {
            throw Error("Buffer.grow: negative count");
        }
        const m = this.#grow(n);
        this.#reslice(m);
    }
    async readFrom(r) {
        let n = 0;
        const tmp = new Uint8Array(MIN_READ);
        while(true){
            const shouldGrow = this.capacity - this.length < MIN_READ;
            const buf = shouldGrow ? tmp : new Uint8Array(this.#buf.buffer, this.length);
            const nread = await r.read(buf);
            if (nread === null) {
                return n;
            }
            if (shouldGrow) this.writeSync(buf.subarray(0, nread));
            else this.#reslice(this.length + nread);
            n += nread;
        }
    }
    readFromSync(r) {
        let n = 0;
        const tmp = new Uint8Array(MIN_READ);
        while(true){
            const shouldGrow = this.capacity - this.length < MIN_READ;
            const buf = shouldGrow ? tmp : new Uint8Array(this.#buf.buffer, this.length);
            const nread = r.readSync(buf);
            if (nread === null) {
                return n;
            }
            if (shouldGrow) this.writeSync(buf.subarray(0, nread));
            else this.#reslice(this.length + nread);
            n += nread;
        }
    }
}
const BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
    if (data === null) return false;
    let code;
    let bitlen = 0;
    const max = data.length;
    const map = BASE64_MAP;
    for(let idx = 0; idx < max; idx++){
        code = map.indexOf(data.charAt(idx));
        if (code > 64) continue;
        if (code < 0) return false;
        bitlen += 6;
    }
    return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
    const input = data.replace(/[\r\n=]/g, "");
    const max = input.length;
    const map = BASE64_MAP;
    const result = [];
    let bits = 0;
    for(let idx = 0; idx < max; idx++){
        if (idx % 4 === 0 && idx) {
            result.push(bits >> 16 & 0xff);
            result.push(bits >> 8 & 0xff);
            result.push(bits & 0xff);
        }
        bits = bits << 6 | map.indexOf(input.charAt(idx));
    }
    const tailbits = max % 4 * 6;
    if (tailbits === 0) {
        result.push(bits >> 16 & 0xff);
        result.push(bits >> 8 & 0xff);
        result.push(bits & 0xff);
    } else if (tailbits === 18) {
        result.push(bits >> 10 & 0xff);
        result.push(bits >> 2 & 0xff);
    } else if (tailbits === 12) {
        result.push(bits >> 4 & 0xff);
    }
    return new Buffer(new Uint8Array(result));
}
function representYamlBinary(object) {
    const max = object.length;
    const map = BASE64_MAP;
    let result = "";
    let bits = 0;
    for(let idx = 0; idx < max; idx++){
        if (idx % 3 === 0 && idx) {
            result += map[bits >> 18 & 0x3f];
            result += map[bits >> 12 & 0x3f];
            result += map[bits >> 6 & 0x3f];
            result += map[bits & 0x3f];
        }
        bits = (bits << 8) + object[idx];
    }
    const tail = max % 3;
    if (tail === 0) {
        result += map[bits >> 18 & 0x3f];
        result += map[bits >> 12 & 0x3f];
        result += map[bits >> 6 & 0x3f];
        result += map[bits & 0x3f];
    } else if (tail === 2) {
        result += map[bits >> 10 & 0x3f];
        result += map[bits >> 4 & 0x3f];
        result += map[bits << 2 & 0x3f];
        result += map[64];
    } else if (tail === 1) {
        result += map[bits >> 2 & 0x3f];
        result += map[bits << 4 & 0x3f];
        result += map[64];
        result += map[64];
    }
    return result;
}
function isBinary(obj) {
    if (typeof obj?.readSync !== "function") {
        return false;
    }
    const buf = new Buffer();
    try {
        if (0 > buf.readFromSync(obj)) return true;
        return false;
    } catch  {
        return false;
    } finally{
        buf.reset();
    }
}
const binary = new Type("tag:yaml.org,2002:binary", {
    construct: constructYamlBinary,
    kind: "scalar",
    predicate: isBinary,
    represent: representYamlBinary,
    resolve: resolveYamlBinary
});
function resolveYamlBoolean(data) {
    const max = data.length;
    return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
    return data === "true" || data === "True" || data === "TRUE";
}
const bool = new Type("tag:yaml.org,2002:bool", {
    construct: constructYamlBoolean,
    defaultStyle: "lowercase",
    kind: "scalar",
    predicate: isBoolean,
    represent: {
        lowercase (object) {
            return object ? "true" : "false";
        },
        uppercase (object) {
            return object ? "TRUE" : "FALSE";
        },
        camelcase (object) {
            return object ? "True" : "False";
        }
    },
    resolve: resolveYamlBoolean
});
const YAML_FLOAT_PATTERN = new RegExp("^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?" + "|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?" + "|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*" + "|[-+]?\\.(?:inf|Inf|INF)" + "|\\.(?:nan|NaN|NAN))$");
function resolveYamlFloat(data) {
    if (!YAML_FLOAT_PATTERN.test(data) || data[data.length - 1] === "_") {
        return false;
    }
    return true;
}
function constructYamlFloat(data) {
    let value = data.replace(/_/g, "").toLowerCase();
    const sign = value[0] === "-" ? -1 : 1;
    const digits = [];
    if ("+-".indexOf(value[0]) >= 0) {
        value = value.slice(1);
    }
    if (value === ".inf") {
        return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    }
    if (value === ".nan") {
        return NaN;
    }
    if (value.indexOf(":") >= 0) {
        value.split(":").forEach((v)=>{
            digits.unshift(parseFloat(v));
        });
        let valueNb = 0.0;
        let base = 1;
        digits.forEach((d)=>{
            valueNb += d * base;
            base *= 60;
        });
        return sign * valueNb;
    }
    return sign * parseFloat(value);
}
const SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
    if (isNaN(object)) {
        switch(style){
            case "lowercase":
                return ".nan";
            case "uppercase":
                return ".NAN";
            case "camelcase":
                return ".NaN";
        }
    } else if (Number.POSITIVE_INFINITY === object) {
        switch(style){
            case "lowercase":
                return ".inf";
            case "uppercase":
                return ".INF";
            case "camelcase":
                return ".Inf";
        }
    } else if (Number.NEGATIVE_INFINITY === object) {
        switch(style){
            case "lowercase":
                return "-.inf";
            case "uppercase":
                return "-.INF";
            case "camelcase":
                return "-.Inf";
        }
    } else if (isNegativeZero(object)) {
        return "-0.0";
    }
    const res = object.toString(10);
    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || isNegativeZero(object));
}
const __float = new Type("tag:yaml.org,2002:float", {
    construct: constructYamlFloat,
    defaultStyle: "lowercase",
    kind: "scalar",
    predicate: isFloat,
    represent: representYamlFloat,
    resolve: resolveYamlFloat
});
function reconstructFunction(code) {
    const func = new Function(`return ${code}`)();
    if (!(func instanceof Function)) {
        throw new TypeError(`Expected function but got ${typeof func}: ${code}`);
    }
    return func;
}
new Type("tag:yaml.org,2002:js/function", {
    kind: "scalar",
    resolve (data) {
        if (data === null) {
            return false;
        }
        try {
            reconstructFunction(`${data}`);
            return true;
        } catch (_err) {
            return false;
        }
    },
    construct (data) {
        return reconstructFunction(data);
    },
    predicate (object) {
        return object instanceof Function;
    },
    represent (object) {
        return object.toString();
    }
});
function isHexCode(c) {
    return 0x30 <= c && c <= 0x39 || 0x41 <= c && c <= 0x46 || 0x61 <= c && c <= 0x66;
}
function isOctCode(c) {
    return 0x30 <= c && c <= 0x37;
}
function isDecCode(c) {
    return 0x30 <= c && c <= 0x39;
}
function resolveYamlInteger(data) {
    const max = data.length;
    let index = 0;
    let hasDigits = false;
    if (!max) return false;
    let ch = data[index];
    if (ch === "-" || ch === "+") {
        ch = data[++index];
    }
    if (ch === "0") {
        if (index + 1 === max) return true;
        ch = data[++index];
        if (ch === "b") {
            index++;
            for(; index < max; index++){
                ch = data[index];
                if (ch === "_") continue;
                if (ch !== "0" && ch !== "1") return false;
                hasDigits = true;
            }
            return hasDigits && ch !== "_";
        }
        if (ch === "x") {
            index++;
            for(; index < max; index++){
                ch = data[index];
                if (ch === "_") continue;
                if (!isHexCode(data.charCodeAt(index))) return false;
                hasDigits = true;
            }
            return hasDigits && ch !== "_";
        }
        for(; index < max; index++){
            ch = data[index];
            if (ch === "_") continue;
            if (!isOctCode(data.charCodeAt(index))) return false;
            hasDigits = true;
        }
        return hasDigits && ch !== "_";
    }
    if (ch === "_") return false;
    for(; index < max; index++){
        ch = data[index];
        if (ch === "_") continue;
        if (ch === ":") break;
        if (!isDecCode(data.charCodeAt(index))) {
            return false;
        }
        hasDigits = true;
    }
    if (!hasDigits || ch === "_") return false;
    if (ch !== ":") return true;
    return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
}
function constructYamlInteger(data) {
    let value = data;
    const digits = [];
    if (value.indexOf("_") !== -1) {
        value = value.replace(/_/g, "");
    }
    let sign = 1;
    let ch = value[0];
    if (ch === "-" || ch === "+") {
        if (ch === "-") sign = -1;
        value = value.slice(1);
        ch = value[0];
    }
    if (value === "0") return 0;
    if (ch === "0") {
        if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
        if (value[1] === "x") return sign * parseInt(value, 16);
        return sign * parseInt(value, 8);
    }
    if (value.indexOf(":") !== -1) {
        value.split(":").forEach((v)=>{
            digits.unshift(parseInt(v, 10));
        });
        let valueInt = 0;
        let base = 1;
        digits.forEach((d)=>{
            valueInt += d * base;
            base *= 60;
        });
        return sign * valueInt;
    }
    return sign * parseInt(value, 10);
}
function isInteger(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && object % 1 === 0 && !isNegativeZero(object);
}
const __int = new Type("tag:yaml.org,2002:int", {
    construct: constructYamlInteger,
    defaultStyle: "decimal",
    kind: "scalar",
    predicate: isInteger,
    represent: {
        binary (obj) {
            return obj >= 0 ? `0b${obj.toString(2)}` : `-0b${obj.toString(2).slice(1)}`;
        },
        octal (obj) {
            return obj >= 0 ? `0${obj.toString(8)}` : `-0${obj.toString(8).slice(1)}`;
        },
        decimal (obj) {
            return obj.toString(10);
        },
        hexadecimal (obj) {
            return obj >= 0 ? `0x${obj.toString(16).toUpperCase()}` : `-0x${obj.toString(16).toUpperCase().slice(1)}`;
        }
    },
    resolve: resolveYamlInteger,
    styleAliases: {
        binary: [
            2,
            "bin"
        ],
        decimal: [
            10,
            "dec"
        ],
        hexadecimal: [
            16,
            "hex"
        ],
        octal: [
            8,
            "oct"
        ]
    }
});
const map = new Type("tag:yaml.org,2002:map", {
    construct (data) {
        return data !== null ? data : {};
    },
    kind: "mapping"
});
function resolveYamlMerge(data) {
    return data === "<<" || data === null;
}
const merge = new Type("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: resolveYamlMerge
});
function resolveYamlNull(data) {
    const max = data.length;
    return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
    return null;
}
function isNull(object) {
    return object === null;
}
const nil = new Type("tag:yaml.org,2002:null", {
    construct: constructYamlNull,
    defaultStyle: "lowercase",
    kind: "scalar",
    predicate: isNull,
    represent: {
        canonical () {
            return "~";
        },
        lowercase () {
            return "null";
        },
        uppercase () {
            return "NULL";
        },
        camelcase () {
            return "Null";
        }
    },
    resolve: resolveYamlNull
});
const { hasOwn } = Object;
const _toString = Object.prototype.toString;
function resolveYamlOmap(data) {
    const objectKeys = [];
    let pairKey = "";
    let pairHasKey = false;
    for (const pair of data){
        pairHasKey = false;
        if (_toString.call(pair) !== "[object Object]") return false;
        for(pairKey in pair){
            if (hasOwn(pair, pairKey)) {
                if (!pairHasKey) pairHasKey = true;
                else return false;
            }
        }
        if (!pairHasKey) return false;
        if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
        else return false;
    }
    return true;
}
function constructYamlOmap(data) {
    return data !== null ? data : [];
}
const omap = new Type("tag:yaml.org,2002:omap", {
    construct: constructYamlOmap,
    kind: "sequence",
    resolve: resolveYamlOmap
});
const _toString1 = Object.prototype.toString;
function resolveYamlPairs(data) {
    const result = Array.from({
        length: data.length
    });
    for(let index = 0; index < data.length; index++){
        const pair = data[index];
        if (_toString1.call(pair) !== "[object Object]") return false;
        const keys = Object.keys(pair);
        if (keys.length !== 1) return false;
        result[index] = [
            keys[0],
            pair[keys[0]]
        ];
    }
    return true;
}
function constructYamlPairs(data) {
    if (data === null) return [];
    const result = Array.from({
        length: data.length
    });
    for(let index = 0; index < data.length; index += 1){
        const pair = data[index];
        const keys = Object.keys(pair);
        result[index] = [
            keys[0],
            pair[keys[0]]
        ];
    }
    return result;
}
const pairs = new Type("tag:yaml.org,2002:pairs", {
    construct: constructYamlPairs,
    kind: "sequence",
    resolve: resolveYamlPairs
});
const REGEXP = /^\/(?<regexp>[\s\S]+)\/(?<modifiers>[gismuy]*)$/;
const regexp = new Type("tag:yaml.org,2002:js/regexp", {
    kind: "scalar",
    resolve (data) {
        if (data === null || !data.length) {
            return false;
        }
        const regexp = `${data}`;
        if (regexp.charAt(0) === "/") {
            if (!REGEXP.test(data)) {
                return false;
            }
            const modifiers = [
                ...regexp.match(REGEXP)?.groups?.modifiers ?? ""
            ];
            if (new Set(modifiers).size < modifiers.length) {
                return false;
            }
        }
        return true;
    },
    construct (data) {
        const { regexp = `${data}`, modifiers = "" } = `${data}`.match(REGEXP)?.groups ?? {};
        return new RegExp(regexp, modifiers);
    },
    predicate (object) {
        return object instanceof RegExp;
    },
    represent (object) {
        return object.toString();
    }
});
const seq = new Type("tag:yaml.org,2002:seq", {
    construct (data) {
        return data !== null ? data : [];
    },
    kind: "sequence"
});
const { hasOwn: hasOwn1 } = Object;
function resolveYamlSet(data) {
    if (data === null) return true;
    for(const key in data){
        if (hasOwn1(data, key)) {
            if (data[key] !== null) return false;
        }
    }
    return true;
}
function constructYamlSet(data) {
    return data !== null ? data : {};
}
const set = new Type("tag:yaml.org,2002:set", {
    construct: constructYamlSet,
    kind: "mapping",
    resolve: resolveYamlSet
});
const str = new Type("tag:yaml.org,2002:str", {
    construct (data) {
        return data !== null ? data : "";
    },
    kind: "scalar"
});
const YAML_DATE_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])" + "-([0-9][0-9])" + "-([0-9][0-9])$");
const YAML_TIMESTAMP_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])" + "-([0-9][0-9]?)" + "-([0-9][0-9]?)" + "(?:[Tt]|[ \\t]+)" + "([0-9][0-9]?)" + ":([0-9][0-9])" + ":([0-9][0-9])" + "(?:\\.([0-9]*))?" + "(?:[ \\t]*(Z|([-+])([0-9][0-9]?)" + "(?::([0-9][0-9]))?))?$");
function resolveYamlTimestamp(data) {
    if (data === null) return false;
    if (YAML_DATE_REGEXP.exec(data) !== null) return true;
    if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
    return false;
}
function constructYamlTimestamp(data) {
    let match = YAML_DATE_REGEXP.exec(data);
    if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
    if (match === null) throw new Error("Date resolve error");
    const year = +match[1];
    const month = +match[2] - 1;
    const day = +match[3];
    if (!match[4]) {
        return new Date(Date.UTC(year, month, day));
    }
    const hour = +match[4];
    const minute = +match[5];
    const second = +match[6];
    let fraction = 0;
    if (match[7]) {
        let partFraction = match[7].slice(0, 3);
        while(partFraction.length < 3){
            partFraction += "0";
        }
        fraction = +partFraction;
    }
    let delta = null;
    if (match[9]) {
        const tzHour = +match[10];
        const tzMinute = +(match[11] || 0);
        delta = (tzHour * 60 + tzMinute) * 60000;
        if (match[9] === "-") delta = -delta;
    }
    const date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (delta) date.setTime(date.getTime() - delta);
    return date;
}
function representYamlTimestamp(date) {
    return date.toISOString();
}
const timestamp = new Type("tag:yaml.org,2002:timestamp", {
    construct: constructYamlTimestamp,
    instanceOf: Date,
    kind: "scalar",
    represent: representYamlTimestamp,
    resolve: resolveYamlTimestamp
});
const undefinedType = new Type("tag:yaml.org,2002:js/undefined", {
    kind: "scalar",
    resolve () {
        return true;
    },
    construct () {
        return undefined;
    },
    predicate (object) {
        return typeof object === "undefined";
    },
    represent () {
        return "";
    }
});
const failsafe = new Schema({
    explicit: [
        str,
        seq,
        map
    ]
});
const json = new Schema({
    implicit: [
        nil,
        bool,
        __int,
        __float
    ],
    include: [
        failsafe
    ]
});
const core = new Schema({
    include: [
        json
    ]
});
const def = new Schema({
    explicit: [
        binary,
        omap,
        pairs,
        set
    ],
    implicit: [
        timestamp,
        merge
    ],
    include: [
        core
    ]
});
new Schema({
    explicit: [
        regexp,
        undefinedType
    ],
    include: [
        def
    ]
});
const { hasOwn: hasOwn2 } = Object;
function simpleEscapeSequence(c) {
    return c === 0x30 ? "\x00" : c === 0x61 ? "\x07" : c === 0x62 ? "\x08" : c === 0x74 ? "\x09" : c === 0x09 ? "\x09" : c === 0x6e ? "\x0A" : c === 0x76 ? "\x0B" : c === 0x66 ? "\x0C" : c === 0x72 ? "\x0D" : c === 0x65 ? "\x1B" : c === 0x20 ? " " : c === 0x22 ? "\x22" : c === 0x2f ? "/" : c === 0x5c ? "\x5C" : c === 0x4e ? "\x85" : c === 0x5f ? "\xA0" : c === 0x4c ? "\u2028" : c === 0x50 ? "\u2029" : "";
}
const simpleEscapeCheck = Array.from({
    length: 256
});
const simpleEscapeMap = Array.from({
    length: 256
});
for(let i = 0; i < 256; i++){
    simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
    simpleEscapeMap[i] = simpleEscapeSequence(i);
}
const { hasOwn: hasOwn3 } = Object;
Object.prototype.toString;
const { hasOwn: hasOwn4 } = Object;
const ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0x00] = "\\0";
ESCAPE_SEQUENCES[0x07] = "\\a";
ESCAPE_SEQUENCES[0x08] = "\\b";
ESCAPE_SEQUENCES[0x09] = "\\t";
ESCAPE_SEQUENCES[0x0a] = "\\n";
ESCAPE_SEQUENCES[0x0b] = "\\v";
ESCAPE_SEQUENCES[0x0c] = "\\f";
ESCAPE_SEQUENCES[0x0d] = "\\r";
ESCAPE_SEQUENCES[0x1b] = "\\e";
ESCAPE_SEQUENCES[0x22] = '\\"';
ESCAPE_SEQUENCES[0x5c] = "\\\\";
ESCAPE_SEQUENCES[0x85] = "\\N";
ESCAPE_SEQUENCES[0xa0] = "\\_";
ESCAPE_SEQUENCES[0x2028] = "\\L";
ESCAPE_SEQUENCES[0x2029] = "\\P";
mod.shape({
    type: mod.string
});
const recordString = mod.dictionary([
    mod.string,
    mod.unknown
]);
mod.shape({
    default: mod.unknown
});
mod.shape({
    nullable: mod.literal(true)
});
mod.shape({
    pattern: mod.string
});
const rangeRegex = /(\[|\()(\*|(\d|\.)+),(\*|(\d|\.)+)(\]|\))/;
mod.shape({
    range: mod.regex(rangeRegex)
});
mod.shape({
    integral: mod.literal(true)
});
mod.shape({
    spec: recordString
});
mod.shape({
    subtype: mod.string
});
mod.shape({
    tag: mod.shape({
        id: mod.string
    }),
    variants: recordString
});
mod.shape({
    values: mod.arrayOf(mod.string)
});
mod.shape({
    charset: mod.string,
    len: mod.number
}).test;
const { any: any1, string: string1, dictionary: dictionary1 } = mod;
dictionary1([
    string1,
    any1
]);
const { shape: shape1, number: number1, boolean: __boolean1, string: string2 } = mod;
const matchLightningdConfig = shape1({
    advanced: shape1({
        clams_remote_websocket: __boolean1
    })
});
const dependencies = {
    "c-lightning": {
        async check (effects, configInput) {
            effects.info("check lightningd");
            const config = matchLightningdConfig.unsafeCast(configInput);
            if (!matchLightningdConfig.test(config)) {
                return {
                    error: "lightningd config is not the correct shape"
                };
            }
            if (!config.advanced.clams_remote_websocket) {
                return {
                    error: "Must have the Clams Remote websocket interface enabled."
                };
            }
            return {
                result: null
            };
        },
        async autoConfigure (effects, configInput) {
            effects.info("Autoconfigure Core Lightning to support Clams Remote.");
            const config = matchLightningdConfig.unsafeCast(configInput);
            config.advanced.clams_remote_websocket = true;
            return {
                result: config
            };
        }
    }
};
export { dependencies as dependencies };
