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
function isObject1(value) {
    return value !== null && typeof value === "object";
}
function repeat(str, count) {
    let result = "";
    for(let cycle = 0; cycle < count; cycle++){
        result += str;
    }
    return result;
}
function isNegativeZero(i) {
    return i === 0 && Number.NEGATIVE_INFINITY === 1 / i;
}
class Mark {
    name;
    buffer;
    position;
    line;
    column;
    constructor(name, buffer, position, line, column){
        this.name = name;
        this.buffer = buffer;
        this.position = position;
        this.line = line;
        this.column = column;
    }
    getSnippet(indent = 4, maxLength = 75) {
        if (!this.buffer) return null;
        let head = "";
        let start = this.position;
        while(start > 0 && "\x00\r\n\x85\u2028\u2029".indexOf(this.buffer.charAt(start - 1)) === -1){
            start -= 1;
            if (this.position - start > maxLength / 2 - 1) {
                head = " ... ";
                start += 5;
                break;
            }
        }
        let tail = "";
        let end = this.position;
        while(end < this.buffer.length && "\x00\r\n\x85\u2028\u2029".indexOf(this.buffer.charAt(end)) === -1){
            end += 1;
            if (end - this.position > maxLength / 2 - 1) {
                tail = " ... ";
                end -= 5;
                break;
            }
        }
        const snippet = this.buffer.slice(start, end);
        return `${repeat(" ", indent)}${head}${snippet}${tail}\n${repeat(" ", indent + this.position - start + head.length)}^`;
    }
    toString(compact) {
        let snippet, where = "";
        if (this.name) {
            where += `in "${this.name}" `;
        }
        where += `at line ${this.line + 1}, column ${this.column + 1}`;
        if (!compact) {
            snippet = this.getSnippet();
            if (snippet) {
                where += `:\n${snippet}`;
            }
        }
        return where;
    }
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
const extended = new Schema({
    explicit: [
        regexp,
        undefinedType
    ],
    include: [
        def
    ]
});
class State {
    schema;
    constructor(schema = def){
        this.schema = schema;
    }
}
class LoaderState extends State {
    input;
    documents;
    length;
    lineIndent;
    lineStart;
    position;
    line;
    filename;
    onWarning;
    legacy;
    json;
    listener;
    implicitTypes;
    typeMap;
    version;
    checkLineBreaks;
    tagMap;
    anchorMap;
    tag;
    anchor;
    kind;
    result;
    constructor(input, { filename, schema, onWarning, legacy = false, json = false, listener = null }){
        super(schema);
        this.input = input;
        this.documents = [];
        this.lineIndent = 0;
        this.lineStart = 0;
        this.position = 0;
        this.line = 0;
        this.result = "";
        this.filename = filename;
        this.onWarning = onWarning;
        this.legacy = legacy;
        this.json = json;
        this.listener = listener;
        this.implicitTypes = this.schema.compiledImplicit;
        this.typeMap = this.schema.compiledTypeMap;
        this.length = input.length;
    }
}
const { hasOwn: hasOwn2 } = Object;
const CONTEXT_BLOCK_IN = 3;
const CONTEXT_BLOCK_OUT = 4;
const CHOMPING_STRIP = 2;
const CHOMPING_KEEP = 3;
const PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
const PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
const PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
const PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
const PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
    return Object.prototype.toString.call(obj);
}
function isEOL(c) {
    return c === 0x0a || c === 0x0d;
}
function isWhiteSpace(c) {
    return c === 0x09 || c === 0x20;
}
function isWsOrEol(c) {
    return c === 0x09 || c === 0x20 || c === 0x0a || c === 0x0d;
}
function isFlowIndicator(c) {
    return c === 0x2c || c === 0x5b || c === 0x5d || c === 0x7b || c === 0x7d;
}
function fromHexCode(c) {
    if (0x30 <= c && c <= 0x39) {
        return c - 0x30;
    }
    const lc = c | 0x20;
    if (0x61 <= lc && lc <= 0x66) {
        return lc - 0x61 + 10;
    }
    return -1;
}
function escapedHexLen(c) {
    if (c === 0x78) {
        return 2;
    }
    if (c === 0x75) {
        return 4;
    }
    if (c === 0x55) {
        return 8;
    }
    return 0;
}
function fromDecimalCode(c) {
    if (0x30 <= c && c <= 0x39) {
        return c - 0x30;
    }
    return -1;
}
function simpleEscapeSequence(c) {
    return c === 0x30 ? "\x00" : c === 0x61 ? "\x07" : c === 0x62 ? "\x08" : c === 0x74 ? "\x09" : c === 0x09 ? "\x09" : c === 0x6e ? "\x0A" : c === 0x76 ? "\x0B" : c === 0x66 ? "\x0C" : c === 0x72 ? "\x0D" : c === 0x65 ? "\x1B" : c === 0x20 ? " " : c === 0x22 ? "\x22" : c === 0x2f ? "/" : c === 0x5c ? "\x5C" : c === 0x4e ? "\x85" : c === 0x5f ? "\xA0" : c === 0x4c ? "\u2028" : c === 0x50 ? "\u2029" : "";
}
function charFromCodepoint(c) {
    if (c <= 0xffff) {
        return String.fromCharCode(c);
    }
    return String.fromCharCode((c - 0x010000 >> 10) + 0xd800, (c - 0x010000 & 0x03ff) + 0xdc00);
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
function generateError(state, message) {
    return new YAMLError(message, new Mark(state.filename, state.input, state.position, state.line, state.position - state.lineStart));
}
function throwError(state, message) {
    throw generateError(state, message);
}
function throwWarning(state, message) {
    if (state.onWarning) {
        state.onWarning.call(null, generateError(state, message));
    }
}
const directiveHandlers = {
    YAML (state, _name, ...args) {
        if (state.version !== null) {
            return throwError(state, "duplication of %YAML directive");
        }
        if (args.length !== 1) {
            return throwError(state, "YAML directive accepts exactly one argument");
        }
        const match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
        if (match === null) {
            return throwError(state, "ill-formed argument of the YAML directive");
        }
        const major = parseInt(match[1], 10);
        const minor = parseInt(match[2], 10);
        if (major !== 1) {
            return throwError(state, "unacceptable YAML version of the document");
        }
        state.version = args[0];
        state.checkLineBreaks = minor < 2;
        if (minor !== 1 && minor !== 2) {
            return throwWarning(state, "unsupported YAML version of the document");
        }
    },
    TAG (state, _name, ...args) {
        if (args.length !== 2) {
            return throwError(state, "TAG directive accepts exactly two arguments");
        }
        const handle = args[0];
        const prefix = args[1];
        if (!PATTERN_TAG_HANDLE.test(handle)) {
            return throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
        }
        if (state.tagMap && hasOwn2(state.tagMap, handle)) {
            return throwError(state, `there is a previously declared suffix for "${handle}" tag handle`);
        }
        if (!PATTERN_TAG_URI.test(prefix)) {
            return throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
        }
        if (typeof state.tagMap === "undefined") {
            state.tagMap = {};
        }
        state.tagMap[handle] = prefix;
    }
};
function captureSegment(state, start, end, checkJson) {
    let result;
    if (start < end) {
        result = state.input.slice(start, end);
        if (checkJson) {
            for(let position = 0, length = result.length; position < length; position++){
                const character = result.charCodeAt(position);
                if (!(character === 0x09 || 0x20 <= character && character <= 0x10ffff)) {
                    return throwError(state, "expected valid JSON character");
                }
            }
        } else if (PATTERN_NON_PRINTABLE.test(result)) {
            return throwError(state, "the stream contains non-printable characters");
        }
        state.result += result;
    }
}
function mergeMappings(state, destination, source, overridableKeys) {
    if (!isObject1(source)) {
        return throwError(state, "cannot merge mappings; the provided source object is unacceptable");
    }
    const keys = Object.keys(source);
    for(let i = 0, len = keys.length; i < len; i++){
        const key = keys[i];
        if (!hasOwn2(destination, key)) {
            destination[key] = source[key];
            overridableKeys[key] = true;
        }
    }
}
function storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode, startLine, startPos) {
    if (Array.isArray(keyNode)) {
        keyNode = Array.prototype.slice.call(keyNode);
        for(let index = 0, quantity = keyNode.length; index < quantity; index++){
            if (Array.isArray(keyNode[index])) {
                return throwError(state, "nested arrays are not supported inside keys");
            }
            if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
                keyNode[index] = "[object Object]";
            }
        }
    }
    if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
        keyNode = "[object Object]";
    }
    keyNode = String(keyNode);
    if (result === null) {
        result = {};
    }
    if (keyTag === "tag:yaml.org,2002:merge") {
        if (Array.isArray(valueNode)) {
            for(let index = 0, quantity = valueNode.length; index < quantity; index++){
                mergeMappings(state, result, valueNode[index], overridableKeys);
            }
        } else {
            mergeMappings(state, result, valueNode, overridableKeys);
        }
    } else {
        if (!state.json && !hasOwn2(overridableKeys, keyNode) && hasOwn2(result, keyNode)) {
            state.line = startLine || state.line;
            state.position = startPos || state.position;
            return throwError(state, "duplicated mapping key");
        }
        result[keyNode] = valueNode;
        delete overridableKeys[keyNode];
    }
    return result;
}
function readLineBreak(state) {
    const ch = state.input.charCodeAt(state.position);
    if (ch === 0x0a) {
        state.position++;
    } else if (ch === 0x0d) {
        state.position++;
        if (state.input.charCodeAt(state.position) === 0x0a) {
            state.position++;
        }
    } else {
        return throwError(state, "a line break is expected");
    }
    state.line += 1;
    state.lineStart = state.position;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
    let lineBreaks = 0, ch = state.input.charCodeAt(state.position);
    while(ch !== 0){
        while(isWhiteSpace(ch)){
            ch = state.input.charCodeAt(++state.position);
        }
        if (allowComments && ch === 0x23) {
            do {
                ch = state.input.charCodeAt(++state.position);
            }while (ch !== 0x0a && ch !== 0x0d && ch !== 0)
        }
        if (isEOL(ch)) {
            readLineBreak(state);
            ch = state.input.charCodeAt(state.position);
            lineBreaks++;
            state.lineIndent = 0;
            while(ch === 0x20){
                state.lineIndent++;
                ch = state.input.charCodeAt(++state.position);
            }
        } else {
            break;
        }
    }
    if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
        throwWarning(state, "deficient indentation");
    }
    return lineBreaks;
}
function testDocumentSeparator(state) {
    let _position = state.position;
    let ch = state.input.charCodeAt(_position);
    if ((ch === 0x2d || ch === 0x2e) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
        _position += 3;
        ch = state.input.charCodeAt(_position);
        if (ch === 0 || isWsOrEol(ch)) {
            return true;
        }
    }
    return false;
}
function writeFoldedLines(state, count) {
    if (count === 1) {
        state.result += " ";
    } else if (count > 1) {
        state.result += repeat("\n", count - 1);
    }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
    const kind = state.kind;
    const result = state.result;
    let ch = state.input.charCodeAt(state.position);
    if (isWsOrEol(ch) || isFlowIndicator(ch) || ch === 0x23 || ch === 0x26 || ch === 0x2a || ch === 0x21 || ch === 0x7c || ch === 0x3e || ch === 0x27 || ch === 0x22 || ch === 0x25 || ch === 0x40 || ch === 0x60) {
        return false;
    }
    let following;
    if (ch === 0x3f || ch === 0x2d) {
        following = state.input.charCodeAt(state.position + 1);
        if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following)) {
            return false;
        }
    }
    state.kind = "scalar";
    state.result = "";
    let captureEnd, captureStart = captureEnd = state.position;
    let hasPendingContent = false;
    let line = 0;
    while(ch !== 0){
        if (ch === 0x3a) {
            following = state.input.charCodeAt(state.position + 1);
            if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following)) {
                break;
            }
        } else if (ch === 0x23) {
            const preceding = state.input.charCodeAt(state.position - 1);
            if (isWsOrEol(preceding)) {
                break;
            }
        } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && isFlowIndicator(ch)) {
            break;
        } else if (isEOL(ch)) {
            line = state.line;
            const lineStart = state.lineStart;
            const lineIndent = state.lineIndent;
            skipSeparationSpace(state, false, -1);
            if (state.lineIndent >= nodeIndent) {
                hasPendingContent = true;
                ch = state.input.charCodeAt(state.position);
                continue;
            } else {
                state.position = captureEnd;
                state.line = line;
                state.lineStart = lineStart;
                state.lineIndent = lineIndent;
                break;
            }
        }
        if (hasPendingContent) {
            captureSegment(state, captureStart, captureEnd, false);
            writeFoldedLines(state, state.line - line);
            captureStart = captureEnd = state.position;
            hasPendingContent = false;
        }
        if (!isWhiteSpace(ch)) {
            captureEnd = state.position + 1;
        }
        ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, captureEnd, false);
    if (state.result) {
        return true;
    }
    state.kind = kind;
    state.result = result;
    return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
    let ch, captureStart, captureEnd;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 0x27) {
        return false;
    }
    state.kind = "scalar";
    state.result = "";
    state.position++;
    captureStart = captureEnd = state.position;
    while((ch = state.input.charCodeAt(state.position)) !== 0){
        if (ch === 0x27) {
            captureSegment(state, captureStart, state.position, true);
            ch = state.input.charCodeAt(++state.position);
            if (ch === 0x27) {
                captureStart = state.position;
                state.position++;
                captureEnd = state.position;
            } else {
                return true;
            }
        } else if (isEOL(ch)) {
            captureSegment(state, captureStart, captureEnd, true);
            writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
            captureStart = captureEnd = state.position;
        } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
            return throwError(state, "unexpected end of the document within a single quoted scalar");
        } else {
            state.position++;
            captureEnd = state.position;
        }
    }
    return throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 0x22) {
        return false;
    }
    state.kind = "scalar";
    state.result = "";
    state.position++;
    let captureEnd, captureStart = captureEnd = state.position;
    let tmp;
    while((ch = state.input.charCodeAt(state.position)) !== 0){
        if (ch === 0x22) {
            captureSegment(state, captureStart, state.position, true);
            state.position++;
            return true;
        }
        if (ch === 0x5c) {
            captureSegment(state, captureStart, state.position, true);
            ch = state.input.charCodeAt(++state.position);
            if (isEOL(ch)) {
                skipSeparationSpace(state, false, nodeIndent);
            } else if (ch < 256 && simpleEscapeCheck[ch]) {
                state.result += simpleEscapeMap[ch];
                state.position++;
            } else if ((tmp = escapedHexLen(ch)) > 0) {
                let hexLength = tmp;
                let hexResult = 0;
                for(; hexLength > 0; hexLength--){
                    ch = state.input.charCodeAt(++state.position);
                    if ((tmp = fromHexCode(ch)) >= 0) {
                        hexResult = (hexResult << 4) + tmp;
                    } else {
                        return throwError(state, "expected hexadecimal character");
                    }
                }
                state.result += charFromCodepoint(hexResult);
                state.position++;
            } else {
                return throwError(state, "unknown escape sequence");
            }
            captureStart = captureEnd = state.position;
        } else if (isEOL(ch)) {
            captureSegment(state, captureStart, captureEnd, true);
            writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
            captureStart = captureEnd = state.position;
        } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
            return throwError(state, "unexpected end of the document within a double quoted scalar");
        } else {
            state.position++;
            captureEnd = state.position;
        }
    }
    return throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
    let ch = state.input.charCodeAt(state.position);
    let terminator;
    let isMapping = true;
    let result = {};
    if (ch === 0x5b) {
        terminator = 0x5d;
        isMapping = false;
        result = [];
    } else if (ch === 0x7b) {
        terminator = 0x7d;
    } else {
        return false;
    }
    if (state.anchor !== null && typeof state.anchor != "undefined" && typeof state.anchorMap != "undefined") {
        state.anchorMap[state.anchor] = result;
    }
    ch = state.input.charCodeAt(++state.position);
    const tag = state.tag, anchor = state.anchor;
    let readNext = true;
    let valueNode, keyNode, keyTag = keyNode = valueNode = null, isExplicitPair, isPair = isExplicitPair = false;
    let following = 0, line = 0;
    const overridableKeys = {};
    while(ch !== 0){
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if (ch === terminator) {
            state.position++;
            state.tag = tag;
            state.anchor = anchor;
            state.kind = isMapping ? "mapping" : "sequence";
            state.result = result;
            return true;
        }
        if (!readNext) {
            return throwError(state, "missed comma between flow collection entries");
        }
        keyTag = keyNode = valueNode = null;
        isPair = isExplicitPair = false;
        if (ch === 0x3f) {
            following = state.input.charCodeAt(state.position + 1);
            if (isWsOrEol(following)) {
                isPair = isExplicitPair = true;
                state.position++;
                skipSeparationSpace(state, true, nodeIndent);
            }
        }
        line = state.line;
        composeNode(state, nodeIndent, 1, false, true);
        keyTag = state.tag || null;
        keyNode = state.result;
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if ((isExplicitPair || state.line === line) && ch === 0x3a) {
            isPair = true;
            ch = state.input.charCodeAt(++state.position);
            skipSeparationSpace(state, true, nodeIndent);
            composeNode(state, nodeIndent, 1, false, true);
            valueNode = state.result;
        }
        if (isMapping) {
            storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode);
        } else if (isPair) {
            result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
        } else {
            result.push(keyNode);
        }
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if (ch === 0x2c) {
            readNext = true;
            ch = state.input.charCodeAt(++state.position);
        } else {
            readNext = false;
        }
    }
    return throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
    let chomping = 1, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false;
    let ch = state.input.charCodeAt(state.position);
    let folding = false;
    if (ch === 0x7c) {
        folding = false;
    } else if (ch === 0x3e) {
        folding = true;
    } else {
        return false;
    }
    state.kind = "scalar";
    state.result = "";
    let tmp = 0;
    while(ch !== 0){
        ch = state.input.charCodeAt(++state.position);
        if (ch === 0x2b || ch === 0x2d) {
            if (1 === chomping) {
                chomping = ch === 0x2b ? CHOMPING_KEEP : CHOMPING_STRIP;
            } else {
                return throwError(state, "repeat of a chomping mode identifier");
            }
        } else if ((tmp = fromDecimalCode(ch)) >= 0) {
            if (tmp === 0) {
                return throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
            } else if (!detectedIndent) {
                textIndent = nodeIndent + tmp - 1;
                detectedIndent = true;
            } else {
                return throwError(state, "repeat of an indentation width identifier");
            }
        } else {
            break;
        }
    }
    if (isWhiteSpace(ch)) {
        do {
            ch = state.input.charCodeAt(++state.position);
        }while (isWhiteSpace(ch))
        if (ch === 0x23) {
            do {
                ch = state.input.charCodeAt(++state.position);
            }while (!isEOL(ch) && ch !== 0)
        }
    }
    while(ch !== 0){
        readLineBreak(state);
        state.lineIndent = 0;
        ch = state.input.charCodeAt(state.position);
        while((!detectedIndent || state.lineIndent < textIndent) && ch === 0x20){
            state.lineIndent++;
            ch = state.input.charCodeAt(++state.position);
        }
        if (!detectedIndent && state.lineIndent > textIndent) {
            textIndent = state.lineIndent;
        }
        if (isEOL(ch)) {
            emptyLines++;
            continue;
        }
        if (state.lineIndent < textIndent) {
            if (chomping === 3) {
                state.result += repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
            } else if (chomping === 1) {
                if (didReadContent) {
                    state.result += "\n";
                }
            }
            break;
        }
        if (folding) {
            if (isWhiteSpace(ch)) {
                atMoreIndented = true;
                state.result += repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
            } else if (atMoreIndented) {
                atMoreIndented = false;
                state.result += repeat("\n", emptyLines + 1);
            } else if (emptyLines === 0) {
                if (didReadContent) {
                    state.result += " ";
                }
            } else {
                state.result += repeat("\n", emptyLines);
            }
        } else {
            state.result += repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        }
        didReadContent = true;
        detectedIndent = true;
        emptyLines = 0;
        const captureStart = state.position;
        while(!isEOL(ch) && ch !== 0){
            ch = state.input.charCodeAt(++state.position);
        }
        captureSegment(state, captureStart, state.position, false);
    }
    return true;
}
function readBlockSequence(state, nodeIndent) {
    let line, following, detected = false, ch;
    const tag = state.tag, anchor = state.anchor, result = [];
    if (state.anchor !== null && typeof state.anchor !== "undefined" && typeof state.anchorMap !== "undefined") {
        state.anchorMap[state.anchor] = result;
    }
    ch = state.input.charCodeAt(state.position);
    while(ch !== 0){
        if (ch !== 0x2d) {
            break;
        }
        following = state.input.charCodeAt(state.position + 1);
        if (!isWsOrEol(following)) {
            break;
        }
        detected = true;
        state.position++;
        if (skipSeparationSpace(state, true, -1)) {
            if (state.lineIndent <= nodeIndent) {
                result.push(null);
                ch = state.input.charCodeAt(state.position);
                continue;
            }
        }
        line = state.line;
        composeNode(state, nodeIndent, 3, false, true);
        result.push(state.result);
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
        if ((state.line === line || state.lineIndent > nodeIndent) && ch !== 0) {
            return throwError(state, "bad indentation of a sequence entry");
        } else if (state.lineIndent < nodeIndent) {
            break;
        }
    }
    if (detected) {
        state.tag = tag;
        state.anchor = anchor;
        state.kind = "sequence";
        state.result = result;
        return true;
    }
    return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
    const tag = state.tag, anchor = state.anchor, result = {}, overridableKeys = {};
    let following, allowCompact = false, line, pos, keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
    if (state.anchor !== null && typeof state.anchor !== "undefined" && typeof state.anchorMap !== "undefined") {
        state.anchorMap[state.anchor] = result;
    }
    ch = state.input.charCodeAt(state.position);
    while(ch !== 0){
        following = state.input.charCodeAt(state.position + 1);
        line = state.line;
        pos = state.position;
        if ((ch === 0x3f || ch === 0x3a) && isWsOrEol(following)) {
            if (ch === 0x3f) {
                if (atExplicitKey) {
                    storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
                    keyTag = keyNode = valueNode = null;
                }
                detected = true;
                atExplicitKey = true;
                allowCompact = true;
            } else if (atExplicitKey) {
                atExplicitKey = false;
                allowCompact = true;
            } else {
                return throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
            }
            state.position += 1;
            ch = following;
        } else if (composeNode(state, flowIndent, 2, false, true)) {
            if (state.line === line) {
                ch = state.input.charCodeAt(state.position);
                while(isWhiteSpace(ch)){
                    ch = state.input.charCodeAt(++state.position);
                }
                if (ch === 0x3a) {
                    ch = state.input.charCodeAt(++state.position);
                    if (!isWsOrEol(ch)) {
                        return throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
                    }
                    if (atExplicitKey) {
                        storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
                        keyTag = keyNode = valueNode = null;
                    }
                    detected = true;
                    atExplicitKey = false;
                    allowCompact = false;
                    keyTag = state.tag;
                    keyNode = state.result;
                } else if (detected) {
                    return throwError(state, "can not read an implicit mapping pair; a colon is missed");
                } else {
                    state.tag = tag;
                    state.anchor = anchor;
                    return true;
                }
            } else if (detected) {
                return throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
            } else {
                state.tag = tag;
                state.anchor = anchor;
                return true;
            }
        } else {
            break;
        }
        if (state.line === line || state.lineIndent > nodeIndent) {
            if (composeNode(state, nodeIndent, 4, true, allowCompact)) {
                if (atExplicitKey) {
                    keyNode = state.result;
                } else {
                    valueNode = state.result;
                }
            }
            if (!atExplicitKey) {
                storeMappingPair(state, result, overridableKeys, keyTag, keyNode, valueNode, line, pos);
                keyTag = keyNode = valueNode = null;
            }
            skipSeparationSpace(state, true, -1);
            ch = state.input.charCodeAt(state.position);
        }
        if (state.lineIndent > nodeIndent && ch !== 0) {
            return throwError(state, "bad indentation of a mapping entry");
        } else if (state.lineIndent < nodeIndent) {
            break;
        }
    }
    if (atExplicitKey) {
        storeMappingPair(state, result, overridableKeys, keyTag, keyNode, null);
    }
    if (detected) {
        state.tag = tag;
        state.anchor = anchor;
        state.kind = "mapping";
        state.result = result;
    }
    return detected;
}
function readTagProperty(state) {
    let position, isVerbatim = false, isNamed = false, tagHandle = "", tagName, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 0x21) return false;
    if (state.tag !== null) {
        return throwError(state, "duplication of a tag property");
    }
    ch = state.input.charCodeAt(++state.position);
    if (ch === 0x3c) {
        isVerbatim = true;
        ch = state.input.charCodeAt(++state.position);
    } else if (ch === 0x21) {
        isNamed = true;
        tagHandle = "!!";
        ch = state.input.charCodeAt(++state.position);
    } else {
        tagHandle = "!";
    }
    position = state.position;
    if (isVerbatim) {
        do {
            ch = state.input.charCodeAt(++state.position);
        }while (ch !== 0 && ch !== 0x3e)
        if (state.position < state.length) {
            tagName = state.input.slice(position, state.position);
            ch = state.input.charCodeAt(++state.position);
        } else {
            return throwError(state, "unexpected end of the stream within a verbatim tag");
        }
    } else {
        while(ch !== 0 && !isWsOrEol(ch)){
            if (ch === 0x21) {
                if (!isNamed) {
                    tagHandle = state.input.slice(position - 1, state.position + 1);
                    if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
                        return throwError(state, "named tag handle cannot contain such characters");
                    }
                    isNamed = true;
                    position = state.position + 1;
                } else {
                    return throwError(state, "tag suffix cannot contain exclamation marks");
                }
            }
            ch = state.input.charCodeAt(++state.position);
        }
        tagName = state.input.slice(position, state.position);
        if (PATTERN_FLOW_INDICATORS.test(tagName)) {
            return throwError(state, "tag suffix cannot contain flow indicator characters");
        }
    }
    if (tagName && !PATTERN_TAG_URI.test(tagName)) {
        return throwError(state, `tag name cannot contain such characters: ${tagName}`);
    }
    if (isVerbatim) {
        state.tag = tagName;
    } else if (typeof state.tagMap !== "undefined" && hasOwn2(state.tagMap, tagHandle)) {
        state.tag = state.tagMap[tagHandle] + tagName;
    } else if (tagHandle === "!") {
        state.tag = `!${tagName}`;
    } else if (tagHandle === "!!") {
        state.tag = `tag:yaml.org,2002:${tagName}`;
    } else {
        return throwError(state, `undeclared tag handle "${tagHandle}"`);
    }
    return true;
}
function readAnchorProperty(state) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 0x26) return false;
    if (state.anchor !== null) {
        return throwError(state, "duplication of an anchor property");
    }
    ch = state.input.charCodeAt(++state.position);
    const position = state.position;
    while(ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)){
        ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === position) {
        return throwError(state, "name of an anchor node must contain at least one character");
    }
    state.anchor = state.input.slice(position, state.position);
    return true;
}
function readAlias(state) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 0x2a) return false;
    ch = state.input.charCodeAt(++state.position);
    const _position = state.position;
    while(ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)){
        ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === _position) {
        return throwError(state, "name of an alias node must contain at least one character");
    }
    const alias = state.input.slice(_position, state.position);
    if (typeof state.anchorMap !== "undefined" && !hasOwn2(state.anchorMap, alias)) {
        return throwError(state, `unidentified alias "${alias}"`);
    }
    if (typeof state.anchorMap !== "undefined") {
        state.result = state.anchorMap[alias];
    }
    skipSeparationSpace(state, true, -1);
    return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
    let allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, type, flowIndent, blockIndent;
    if (state.listener && state.listener !== null) {
        state.listener("open", state);
    }
    state.tag = null;
    state.anchor = null;
    state.kind = null;
    state.result = null;
    const allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
    if (allowToSeek) {
        if (skipSeparationSpace(state, true, -1)) {
            atNewLine = true;
            if (state.lineIndent > parentIndent) {
                indentStatus = 1;
            } else if (state.lineIndent === parentIndent) {
                indentStatus = 0;
            } else if (state.lineIndent < parentIndent) {
                indentStatus = -1;
            }
        }
    }
    if (indentStatus === 1) {
        while(readTagProperty(state) || readAnchorProperty(state)){
            if (skipSeparationSpace(state, true, -1)) {
                atNewLine = true;
                allowBlockCollections = allowBlockStyles;
                if (state.lineIndent > parentIndent) {
                    indentStatus = 1;
                } else if (state.lineIndent === parentIndent) {
                    indentStatus = 0;
                } else if (state.lineIndent < parentIndent) {
                    indentStatus = -1;
                }
            } else {
                allowBlockCollections = false;
            }
        }
    }
    if (allowBlockCollections) {
        allowBlockCollections = atNewLine || allowCompact;
    }
    if (indentStatus === 1 || 4 === nodeContext) {
        const cond = 1 === nodeContext || 2 === nodeContext;
        flowIndent = cond ? parentIndent : parentIndent + 1;
        blockIndent = state.position - state.lineStart;
        if (indentStatus === 1) {
            if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
                hasContent = true;
            } else {
                if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
                    hasContent = true;
                } else if (readAlias(state)) {
                    hasContent = true;
                    if (state.tag !== null || state.anchor !== null) {
                        return throwError(state, "alias node should not have Any properties");
                    }
                } else if (readPlainScalar(state, flowIndent, 1 === nodeContext)) {
                    hasContent = true;
                    if (state.tag === null) {
                        state.tag = "?";
                    }
                }
                if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
                    state.anchorMap[state.anchor] = state.result;
                }
            }
        } else if (indentStatus === 0) {
            hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
        }
    }
    if (state.tag !== null && state.tag !== "!") {
        if (state.tag === "?") {
            for(let typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex++){
                type = state.implicitTypes[typeIndex];
                if (type.resolve(state.result)) {
                    state.result = type.construct(state.result);
                    state.tag = type.tag;
                    if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
                        state.anchorMap[state.anchor] = state.result;
                    }
                    break;
                }
            }
        } else if (hasOwn2(state.typeMap[state.kind || "fallback"], state.tag)) {
            type = state.typeMap[state.kind || "fallback"][state.tag];
            if (state.result !== null && type.kind !== state.kind) {
                return throwError(state, `unacceptable node kind for !<${state.tag}> tag; it should be "${type.kind}", not "${state.kind}"`);
            }
            if (!type.resolve(state.result)) {
                return throwError(state, `cannot resolve a node with !<${state.tag}> explicit tag`);
            } else {
                state.result = type.construct(state.result);
                if (state.anchor !== null && typeof state.anchorMap !== "undefined") {
                    state.anchorMap[state.anchor] = state.result;
                }
            }
        } else {
            return throwError(state, `unknown tag !<${state.tag}>`);
        }
    }
    if (state.listener && state.listener !== null) {
        state.listener("close", state);
    }
    return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
    const documentStart = state.position;
    let position, directiveName, directiveArgs, hasDirectives = false, ch;
    state.version = null;
    state.checkLineBreaks = state.legacy;
    state.tagMap = {};
    state.anchorMap = {};
    while((ch = state.input.charCodeAt(state.position)) !== 0){
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
        if (state.lineIndent > 0 || ch !== 0x25) {
            break;
        }
        hasDirectives = true;
        ch = state.input.charCodeAt(++state.position);
        position = state.position;
        while(ch !== 0 && !isWsOrEol(ch)){
            ch = state.input.charCodeAt(++state.position);
        }
        directiveName = state.input.slice(position, state.position);
        directiveArgs = [];
        if (directiveName.length < 1) {
            return throwError(state, "directive name must not be less than one character in length");
        }
        while(ch !== 0){
            while(isWhiteSpace(ch)){
                ch = state.input.charCodeAt(++state.position);
            }
            if (ch === 0x23) {
                do {
                    ch = state.input.charCodeAt(++state.position);
                }while (ch !== 0 && !isEOL(ch))
                break;
            }
            if (isEOL(ch)) break;
            position = state.position;
            while(ch !== 0 && !isWsOrEol(ch)){
                ch = state.input.charCodeAt(++state.position);
            }
            directiveArgs.push(state.input.slice(position, state.position));
        }
        if (ch !== 0) readLineBreak(state);
        if (hasOwn2(directiveHandlers, directiveName)) {
            directiveHandlers[directiveName](state, directiveName, ...directiveArgs);
        } else {
            throwWarning(state, `unknown document directive "${directiveName}"`);
        }
    }
    skipSeparationSpace(state, true, -1);
    if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 0x2d && state.input.charCodeAt(state.position + 1) === 0x2d && state.input.charCodeAt(state.position + 2) === 0x2d) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
    } else if (hasDirectives) {
        return throwError(state, "directives end mark is expected");
    }
    composeNode(state, state.lineIndent - 1, 4, false, true);
    skipSeparationSpace(state, true, -1);
    if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
        throwWarning(state, "non-ASCII line breaks are interpreted as content");
    }
    state.documents.push(state.result);
    if (state.position === state.lineStart && testDocumentSeparator(state)) {
        if (state.input.charCodeAt(state.position) === 0x2e) {
            state.position += 3;
            skipSeparationSpace(state, true, -1);
        }
        return;
    }
    if (state.position < state.length - 1) {
        return throwError(state, "end of the stream or a document separator is expected");
    }
}
function loadDocuments(input, options) {
    input = String(input);
    options = options || {};
    if (input.length !== 0) {
        if (input.charCodeAt(input.length - 1) !== 0x0a && input.charCodeAt(input.length - 1) !== 0x0d) {
            input += "\n";
        }
        if (input.charCodeAt(0) === 0xfeff) {
            input = input.slice(1);
        }
    }
    const state = new LoaderState(input, options);
    state.input += "\0";
    while(state.input.charCodeAt(state.position) === 0x20){
        state.lineIndent += 1;
        state.position += 1;
    }
    while(state.position < state.length - 1){
        readDocument(state);
    }
    return state.documents;
}
function isCbFunction(fn) {
    return typeof fn === "function";
}
function loadAll(input, iteratorOrOption, options) {
    if (!isCbFunction(iteratorOrOption)) {
        return loadDocuments(input, iteratorOrOption);
    }
    const documents = loadDocuments(input, options);
    const iterator = iteratorOrOption;
    for(let index = 0, length = documents.length; index < length; index++){
        iterator(documents[index]);
    }
    return void 0;
}
function load(input, options) {
    const documents = loadDocuments(input, options);
    if (documents.length === 0) {
        return;
    }
    if (documents.length === 1) {
        return documents[0];
    }
    throw new YAMLError("expected a single document in the stream, but found more");
}
function parse(content, options) {
    return load(content, options);
}
function parseAll(content, iterator, options) {
    return loadAll(content, iterator, options);
}
const { hasOwn: hasOwn3 } = Object;
function compileStyleMap(schema, map) {
    if (typeof map === "undefined" || map === null) return {};
    let type;
    const result = {};
    const keys = Object.keys(map);
    let tag, style;
    for(let index = 0, length = keys.length; index < length; index += 1){
        tag = keys[index];
        style = String(map[tag]);
        if (tag.slice(0, 2) === "!!") {
            tag = `tag:yaml.org,2002:${tag.slice(2)}`;
        }
        type = schema.compiledTypeMap.fallback[tag];
        if (type && typeof type.styleAliases !== "undefined" && hasOwn3(type.styleAliases, style)) {
            style = type.styleAliases[style];
        }
        result[tag] = style;
    }
    return result;
}
class DumperState extends State {
    indent;
    noArrayIndent;
    skipInvalid;
    flowLevel;
    sortKeys;
    lineWidth;
    noRefs;
    noCompatMode;
    condenseFlow;
    implicitTypes;
    explicitTypes;
    tag = null;
    result = "";
    duplicates = [];
    usedDuplicates = [];
    styleMap;
    dump;
    constructor({ schema, indent = 2, noArrayIndent = false, skipInvalid = false, flowLevel = -1, styles = null, sortKeys = false, lineWidth = 80, noRefs = false, noCompatMode = false, condenseFlow = false }){
        super(schema);
        this.indent = Math.max(1, indent);
        this.noArrayIndent = noArrayIndent;
        this.skipInvalid = skipInvalid;
        this.flowLevel = flowLevel;
        this.styleMap = compileStyleMap(this.schema, styles);
        this.sortKeys = sortKeys;
        this.lineWidth = lineWidth;
        this.noRefs = noRefs;
        this.noCompatMode = noCompatMode;
        this.condenseFlow = condenseFlow;
        this.implicitTypes = this.schema.compiledImplicit;
        this.explicitTypes = this.schema.compiledExplicit;
    }
}
const _toString2 = Object.prototype.toString;
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
const DEPRECATED_BOOLEANS_SYNTAX = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF"
];
function encodeHex(character) {
    const string = character.toString(16).toUpperCase();
    let handle;
    let length;
    if (character <= 0xff) {
        handle = "x";
        length = 2;
    } else if (character <= 0xffff) {
        handle = "u";
        length = 4;
    } else if (character <= 0xffffffff) {
        handle = "U";
        length = 8;
    } else {
        throw new YAMLError("code point within a string may not be greater than 0xFFFFFFFF");
    }
    return `\\${handle}${repeat("0", length - string.length)}${string}`;
}
function indentString(string, spaces) {
    const ind = repeat(" ", spaces), length = string.length;
    let position = 0, next = -1, result = "", line;
    while(position < length){
        next = string.indexOf("\n", position);
        if (next === -1) {
            line = string.slice(position);
            position = length;
        } else {
            line = string.slice(position, next + 1);
            position = next + 1;
        }
        if (line.length && line !== "\n") result += ind;
        result += line;
    }
    return result;
}
function generateNextLine(state, level) {
    return `\n${repeat(" ", state.indent * level)}`;
}
function testImplicitResolving(state, str) {
    let type;
    for(let index = 0, length = state.implicitTypes.length; index < length; index += 1){
        type = state.implicitTypes[index];
        if (type.resolve(str)) {
            return true;
        }
    }
    return false;
}
function isWhitespace(c) {
    return c === 0x20 || c === 0x09;
}
function isPrintable(c) {
    return 0x00020 <= c && c <= 0x00007e || 0x000a1 <= c && c <= 0x00d7ff && c !== 0x2028 && c !== 0x2029 || 0x0e000 <= c && c <= 0x00fffd && c !== 0xfeff || 0x10000 <= c && c <= 0x10ffff;
}
function isPlainSafe(c) {
    return isPrintable(c) && c !== 0xfeff && c !== 0x2c && c !== 0x5b && c !== 0x5d && c !== 0x7b && c !== 0x7d && c !== 0x3a && c !== 0x23;
}
function isPlainSafeFirst(c) {
    return isPrintable(c) && c !== 0xfeff && !isWhitespace(c) && c !== 0x2d && c !== 0x3f && c !== 0x3a && c !== 0x2c && c !== 0x5b && c !== 0x5d && c !== 0x7b && c !== 0x7d && c !== 0x23 && c !== 0x26 && c !== 0x2a && c !== 0x21 && c !== 0x7c && c !== 0x3e && c !== 0x27 && c !== 0x22 && c !== 0x25 && c !== 0x40 && c !== 0x60;
}
function needIndentIndicator(string) {
    const leadingSpaceRe = /^\n* /;
    return leadingSpaceRe.test(string);
}
const STYLE_PLAIN = 1, STYLE_SINGLE = 2, STYLE_LITERAL = 3, STYLE_FOLDED = 4, STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType) {
    const shouldTrackWidth = lineWidth !== -1;
    let hasLineBreak = false, hasFoldableLine = false, previousLineBreak = -1, plain = isPlainSafeFirst(string.charCodeAt(0)) && !isWhitespace(string.charCodeAt(string.length - 1));
    let __char, i;
    if (singleLineOnly) {
        for(i = 0; i < string.length; i++){
            __char = string.charCodeAt(i);
            if (!isPrintable(__char)) {
                return 5;
            }
            plain = plain && isPlainSafe(__char);
        }
    } else {
        for(i = 0; i < string.length; i++){
            __char = string.charCodeAt(i);
            if (__char === 0x0a) {
                hasLineBreak = true;
                if (shouldTrackWidth) {
                    hasFoldableLine = hasFoldableLine || i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
                    previousLineBreak = i;
                }
            } else if (!isPrintable(__char)) {
                return 5;
            }
            plain = plain && isPlainSafe(__char);
        }
        hasFoldableLine = hasFoldableLine || shouldTrackWidth && i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
    }
    if (!hasLineBreak && !hasFoldableLine) {
        return plain && !testAmbiguousType(string) ? 1 : 2;
    }
    if (indentPerLevel > 9 && needIndentIndicator(string)) {
        return 5;
    }
    return hasFoldableLine ? 4 : 3;
}
function foldLine(line, width) {
    if (line === "" || line[0] === " ") return line;
    const breakRe = / [^ ]/g;
    let match;
    let start = 0, end, curr = 0, next = 0;
    let result = "";
    while(match = breakRe.exec(line)){
        next = match.index;
        if (next - start > width) {
            end = curr > start ? curr : next;
            result += `\n${line.slice(start, end)}`;
            start = end + 1;
        }
        curr = next;
    }
    result += "\n";
    if (line.length - start > width && curr > start) {
        result += `${line.slice(start, curr)}\n${line.slice(curr + 1)}`;
    } else {
        result += line.slice(start);
    }
    return result.slice(1);
}
function dropEndingNewline(string) {
    return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
function foldString(string, width) {
    const lineRe = /(\n+)([^\n]*)/g;
    let result = (()=>{
        let nextLF = string.indexOf("\n");
        nextLF = nextLF !== -1 ? nextLF : string.length;
        lineRe.lastIndex = nextLF;
        return foldLine(string.slice(0, nextLF), width);
    })();
    let prevMoreIndented = string[0] === "\n" || string[0] === " ";
    let moreIndented;
    let match;
    while(match = lineRe.exec(string)){
        const prefix = match[1], line = match[2];
        moreIndented = line[0] === " ";
        result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
        prevMoreIndented = moreIndented;
    }
    return result;
}
function escapeString(string) {
    let result = "";
    let __char, nextChar;
    let escapeSeq;
    for(let i = 0; i < string.length; i++){
        __char = string.charCodeAt(i);
        if (__char >= 0xd800 && __char <= 0xdbff) {
            nextChar = string.charCodeAt(i + 1);
            if (nextChar >= 0xdc00 && nextChar <= 0xdfff) {
                result += encodeHex((__char - 0xd800) * 0x400 + nextChar - 0xdc00 + 0x10000);
                i++;
                continue;
            }
        }
        escapeSeq = ESCAPE_SEQUENCES[__char];
        result += !escapeSeq && isPrintable(__char) ? string[i] : escapeSeq || encodeHex(__char);
    }
    return result;
}
function blockHeader(string, indentPerLevel) {
    const indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
    const clip = string[string.length - 1] === "\n";
    const keep = clip && (string[string.length - 2] === "\n" || string === "\n");
    const chomp = keep ? "+" : clip ? "" : "-";
    return `${indentIndicator}${chomp}\n`;
}
function writeScalar(state, string, level, iskey) {
    state.dump = (()=>{
        if (string.length === 0) {
            return "''";
        }
        if (!state.noCompatMode && DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
            return `'${string}'`;
        }
        const indent = state.indent * Math.max(1, level);
        const lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
        const singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
        function testAmbiguity(str) {
            return testImplicitResolving(state, str);
        }
        switch(chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity)){
            case STYLE_PLAIN:
                return string;
            case STYLE_SINGLE:
                return `'${string.replace(/'/g, "''")}'`;
            case STYLE_LITERAL:
                return `|${blockHeader(string, state.indent)}${dropEndingNewline(indentString(string, indent))}`;
            case STYLE_FOLDED:
                return `>${blockHeader(string, state.indent)}${dropEndingNewline(indentString(foldString(string, lineWidth), indent))}`;
            case STYLE_DOUBLE:
                return `"${escapeString(string)}"`;
            default:
                throw new YAMLError("impossible error: invalid scalar style");
        }
    })();
}
function writeFlowSequence(state, level, object) {
    let _result = "";
    const _tag = state.tag;
    for(let index = 0, length = object.length; index < length; index += 1){
        if (writeNode(state, level, object[index], false, false)) {
            if (index !== 0) _result += `,${!state.condenseFlow ? " " : ""}`;
            _result += state.dump;
        }
    }
    state.tag = _tag;
    state.dump = `[${_result}]`;
}
function writeBlockSequence(state, level, object, compact = false) {
    let _result = "";
    const _tag = state.tag;
    for(let index = 0, length = object.length; index < length; index += 1){
        if (writeNode(state, level + 1, object[index], true, true)) {
            if (!compact || index !== 0) {
                _result += generateNextLine(state, level);
            }
            if (state.dump && 0x0a === state.dump.charCodeAt(0)) {
                _result += "-";
            } else {
                _result += "- ";
            }
            _result += state.dump;
        }
    }
    state.tag = _tag;
    state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
    let _result = "";
    const _tag = state.tag, objectKeyList = Object.keys(object);
    let pairBuffer, objectKey, objectValue;
    for(let index = 0, length = objectKeyList.length; index < length; index += 1){
        pairBuffer = state.condenseFlow ? '"' : "";
        if (index !== 0) pairBuffer += ", ";
        objectKey = objectKeyList[index];
        objectValue = object[objectKey];
        if (!writeNode(state, level, objectKey, false, false)) {
            continue;
        }
        if (state.dump.length > 1024) pairBuffer += "? ";
        pairBuffer += `${state.dump}${state.condenseFlow ? '"' : ""}:${state.condenseFlow ? "" : " "}`;
        if (!writeNode(state, level, objectValue, false, false)) {
            continue;
        }
        pairBuffer += state.dump;
        _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = `{${_result}}`;
}
function writeBlockMapping(state, level, object, compact = false) {
    const _tag = state.tag, objectKeyList = Object.keys(object);
    let _result = "";
    if (state.sortKeys === true) {
        objectKeyList.sort();
    } else if (typeof state.sortKeys === "function") {
        objectKeyList.sort(state.sortKeys);
    } else if (state.sortKeys) {
        throw new YAMLError("sortKeys must be a boolean or a function");
    }
    let pairBuffer = "", objectKey, objectValue, explicitPair;
    for(let index = 0, length = objectKeyList.length; index < length; index += 1){
        pairBuffer = "";
        if (!compact || index !== 0) {
            pairBuffer += generateNextLine(state, level);
        }
        objectKey = objectKeyList[index];
        objectValue = object[objectKey];
        if (!writeNode(state, level + 1, objectKey, true, true, true)) {
            continue;
        }
        explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
        if (explicitPair) {
            if (state.dump && 0x0a === state.dump.charCodeAt(0)) {
                pairBuffer += "?";
            } else {
                pairBuffer += "? ";
            }
        }
        pairBuffer += state.dump;
        if (explicitPair) {
            pairBuffer += generateNextLine(state, level);
        }
        if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
            continue;
        }
        if (state.dump && 0x0a === state.dump.charCodeAt(0)) {
            pairBuffer += ":";
        } else {
            pairBuffer += ": ";
        }
        pairBuffer += state.dump;
        _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = _result || "{}";
}
function detectType(state, object, explicit = false) {
    const typeList = explicit ? state.explicitTypes : state.implicitTypes;
    let type;
    let style;
    let _result;
    for(let index = 0, length = typeList.length; index < length; index += 1){
        type = typeList[index];
        if ((type.instanceOf || type.predicate) && (!type.instanceOf || typeof object === "object" && object instanceof type.instanceOf) && (!type.predicate || type.predicate(object))) {
            state.tag = explicit ? type.tag : "?";
            if (type.represent) {
                style = state.styleMap[type.tag] || type.defaultStyle;
                if (_toString2.call(type.represent) === "[object Function]") {
                    _result = type.represent(object, style);
                } else if (hasOwn4(type.represent, style)) {
                    _result = type.represent[style](object, style);
                } else {
                    throw new YAMLError(`!<${type.tag}> tag resolver accepts not "${style}" style`);
                }
                state.dump = _result;
            }
            return true;
        }
    }
    return false;
}
function writeNode(state, level, object, block, compact, iskey = false) {
    state.tag = null;
    state.dump = object;
    if (!detectType(state, object, false)) {
        detectType(state, object, true);
    }
    const type = _toString2.call(state.dump);
    if (block) {
        block = state.flowLevel < 0 || state.flowLevel > level;
    }
    const objectOrArray = type === "[object Object]" || type === "[object Array]";
    let duplicateIndex = -1;
    let duplicate = false;
    if (objectOrArray) {
        duplicateIndex = state.duplicates.indexOf(object);
        duplicate = duplicateIndex !== -1;
    }
    if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
        compact = false;
    }
    if (duplicate && state.usedDuplicates[duplicateIndex]) {
        state.dump = `*ref_${duplicateIndex}`;
    } else {
        if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
            state.usedDuplicates[duplicateIndex] = true;
        }
        if (type === "[object Object]") {
            if (block && Object.keys(state.dump).length !== 0) {
                writeBlockMapping(state, level, state.dump, compact);
                if (duplicate) {
                    state.dump = `&ref_${duplicateIndex}${state.dump}`;
                }
            } else {
                writeFlowMapping(state, level, state.dump);
                if (duplicate) {
                    state.dump = `&ref_${duplicateIndex} ${state.dump}`;
                }
            }
        } else if (type === "[object Array]") {
            const arrayLevel = state.noArrayIndent && level > 0 ? level - 1 : level;
            if (block && state.dump.length !== 0) {
                writeBlockSequence(state, arrayLevel, state.dump, compact);
                if (duplicate) {
                    state.dump = `&ref_${duplicateIndex}${state.dump}`;
                }
            } else {
                writeFlowSequence(state, arrayLevel, state.dump);
                if (duplicate) {
                    state.dump = `&ref_${duplicateIndex} ${state.dump}`;
                }
            }
        } else if (type === "[object String]") {
            if (state.tag !== "?") {
                writeScalar(state, state.dump, level, iskey);
            }
        } else {
            if (state.skipInvalid) return false;
            throw new YAMLError(`unacceptable kind of an object to dump ${type}`);
        }
        if (state.tag !== null && state.tag !== "?") {
            state.dump = `!<${state.tag}> ${state.dump}`;
        }
    }
    return true;
}
function inspectNode(object, objects, duplicatesIndexes) {
    if (object !== null && typeof object === "object") {
        const index = objects.indexOf(object);
        if (index !== -1) {
            if (duplicatesIndexes.indexOf(index) === -1) {
                duplicatesIndexes.push(index);
            }
        } else {
            objects.push(object);
            if (Array.isArray(object)) {
                for(let idx = 0, length = object.length; idx < length; idx += 1){
                    inspectNode(object[idx], objects, duplicatesIndexes);
                }
            } else {
                const objectKeyList = Object.keys(object);
                for(let idx = 0, length = objectKeyList.length; idx < length; idx += 1){
                    inspectNode(object[objectKeyList[idx]], objects, duplicatesIndexes);
                }
            }
        }
    }
}
function getDuplicateReferences(object, state) {
    const objects = [], duplicatesIndexes = [];
    inspectNode(object, objects, duplicatesIndexes);
    const length = duplicatesIndexes.length;
    for(let index = 0; index < length; index += 1){
        state.duplicates.push(objects[duplicatesIndexes[index]]);
    }
    state.usedDuplicates = Array.from({
        length
    });
}
function dump(input, options) {
    options = options || {};
    const state = new DumperState(options);
    if (!state.noRefs) getDuplicateReferences(input, state);
    if (writeNode(state, 0, input, true, true)) return `${state.dump}\n`;
    return "";
}
function stringify(obj, options) {
    return dump(obj, options);
}
const mod1 = {
    parse: parse,
    parseAll: parseAll,
    stringify: stringify,
    Type: Type,
    CORE_SCHEMA: core,
    DEFAULT_SCHEMA: def,
    EXTENDED_SCHEMA: extended,
    FAILSAFE_SCHEMA: failsafe,
    JSON_SCHEMA: json
};
function incrementLastNumber(list) {
    const newList = [
        ...list
    ];
    newList[newList.length - 1]++;
    return newList;
}
class EmVer {
    values;
    static from(range) {
        if (range instanceof EmVer) {
            return range;
        }
        return EmVer.parse(range);
    }
    static parse(range) {
        const values = range.split(".").map((x)=>parseInt(x));
        for (const value of values){
            if (isNaN(value)) {
                throw new Error(`Couldn't parse range: ${range}`);
            }
        }
        return new EmVer(values);
    }
    constructor(values){
        this.values = values;
    }
    withLastIncremented() {
        return new EmVer(incrementLastNumber(this.values));
    }
    greaterThan(other) {
        for(const i in this.values){
            if (other.values[i] == null) {
                return true;
            }
            if (this.values[i] > other.values[i]) {
                return true;
            }
            if (this.values[i] < other.values[i]) {
                return false;
            }
        }
        return false;
    }
    equals(other) {
        if (other.values.length !== this.values.length) {
            return false;
        }
        for(const i in this.values){
            if (this.values[i] !== other.values[i]) {
                return false;
            }
        }
        return true;
    }
    greaterThanOrEqual(other) {
        return this.greaterThan(other) || this.equals(other);
    }
    lessThanOrEqual(other) {
        return !this.greaterThan(other);
    }
    lessThan(other) {
        return !this.greaterThanOrEqual(other);
    }
    compare(other) {
        if (this.equals(other)) {
            return "equal";
        } else if (this.greaterThan(other)) {
            return "greater";
        } else {
            return "less";
        }
    }
    compareForSort(other) {
        return mod.matches(this.compare(other)).when("equal", ()=>0).when("greater", ()=>1).when("less", ()=>-1).unwrap();
    }
}
function migrationFn(fn) {
    return fn;
}
function fromMapping(migrations, currentVersion) {
    const directionShape = mod.literals("from", "to");
    return async (effects, version, direction)=>{
        if (!directionShape.test(direction)) {
            return {
                error: 'Must specify arg "from" or "to".'
            };
        }
        let configured = true;
        const current = EmVer.parse(currentVersion);
        const other = EmVer.parse(version);
        const filteredMigrations = Object.entries(migrations).map(([version, migration])=>({
                version: EmVer.parse(version),
                migration
            })).filter(({ version })=>version.greaterThan(other) && version.lessThanOrEqual(current));
        const migrationsToRun = mod.matches(direction).when("from", ()=>filteredMigrations.sort((a, b)=>a.version.compareForSort(b.version)).map(({ migration })=>migration.up)).when("to", ()=>filteredMigrations.sort((a, b)=>b.version.compareForSort(a.version)).map(({ migration })=>migration.down)).unwrap();
        for (const migration of migrationsToRun){
            configured = (await migration(effects)).configured && configured;
        }
        return {
            result: {
                configured
            }
        };
    };
}
const isType = mod.shape({
    type: mod.string
});
const recordString = mod.dictionary([
    mod.string,
    mod.unknown
]);
const matchDefault = mod.shape({
    default: mod.unknown
});
const matchNullable = mod.shape({
    nullable: mod.literal(true)
});
const matchPattern = mod.shape({
    pattern: mod.string
});
const rangeRegex = /(\[|\()(\*|(\d|\.)+),(\*|(\d|\.)+)(\]|\))/;
const matchRange = mod.shape({
    range: mod.regex(rangeRegex)
});
const matchIntegral = mod.shape({
    integral: mod.literal(true)
});
const matchSpec = mod.shape({
    spec: recordString
});
const matchSubType = mod.shape({
    subtype: mod.string
});
const matchUnion = mod.shape({
    tag: mod.shape({
        id: mod.string
    }),
    variants: recordString
});
const matchValues = mod.shape({
    values: mod.arrayOf(mod.string)
});
function charRange(value = "") {
    const split = value.split("-").filter(Boolean).map((x)=>x.charCodeAt(0));
    if (split.length < 1) return null;
    if (split.length === 1) return [
        split[0],
        split[0]
    ];
    return [
        split[0],
        split[1]
    ];
}
function generateDefault(generate, { random = ()=>Math.random() } = {}) {
    const validCharSets = generate.charset.split(",").map(charRange).filter(Array.isArray);
    if (validCharSets.length === 0) throw new Error("Expecing that we have a valid charset");
    const max = validCharSets.reduce((acc, x)=>x.reduce((x, y)=>Math.max(x, y), acc), 0);
    let i = 0;
    const answer = Array(generate.len);
    while(i < generate.len){
        const nextValue = Math.round(random() * max);
        const inRange = validCharSets.reduce((acc, [lower, upper])=>acc || nextValue >= lower && nextValue <= upper, false);
        if (!inRange) continue;
        answer[i] = String.fromCharCode(nextValue);
        i++;
    }
    return answer.join("");
}
function withPattern(value) {
    if (matchPattern.test(value)) return mod.regex(RegExp(value.pattern));
    return mod.string;
}
function matchNumberWithRange(range) {
    const matched = rangeRegex.exec(range);
    if (!matched) return mod.number;
    const [, left, leftValue, , rightValue, , right] = matched;
    return mod.number.validate(leftValue === "*" ? (_)=>true : left === "[" ? (x)=>x >= Number(leftValue) : (x)=>x > Number(leftValue), leftValue === "*" ? "any" : left === "[" ? `greaterThanOrEqualTo${leftValue}` : `greaterThan${leftValue}`).validate(rightValue === "*" ? (_)=>true : right === "]" ? (x)=>x <= Number(rightValue) : (x)=>x < Number(rightValue), rightValue === "*" ? "any" : right === "]" ? `lessThanOrEqualTo${rightValue}` : `lessThan${rightValue}`);
}
function withIntegral(parser, value) {
    if (matchIntegral.test(value)) {
        return parser.validate(Number.isInteger, "isIntegral");
    }
    return parser;
}
function withRange(value) {
    if (matchRange.test(value)) {
        return matchNumberWithRange(value.range);
    }
    return mod.number;
}
const isGenerator = mod.shape({
    charset: mod.string,
    len: mod.number
}).test;
function defaultNullable(parser, value) {
    if (matchDefault.test(value)) {
        if (isGenerator(value.default)) return parser.defaultTo(parser.unsafeCast(generateDefault(value.default)));
        return parser.defaultTo(value.default);
    }
    if (matchNullable.test(value)) return parser.optional();
    return parser;
}
function guardAll(value) {
    if (!isType.test(value)) {
        return mod.unknown;
    }
    switch(value.type){
        case "boolean":
            return defaultNullable(mod.boolean, value);
        case "string":
            return defaultNullable(withPattern(value), value);
        case "number":
            return defaultNullable(withIntegral(withRange(value), value), value);
        case "object":
            if (matchSpec.test(value)) {
                return defaultNullable(typeFromProps(value.spec), value);
            }
            return mod.unknown;
        case "list":
            {
                const spec = matchSpec.test(value) && value.spec || {};
                const rangeValidate = matchRange.test(value) && matchNumberWithRange(value.range).test || (()=>true);
                const { default: _, ...arrayOfSpec } = spec;
                const subtype = matchSubType.unsafeCast(value).subtype;
                return defaultNullable(mod.arrayOf(guardAll({
                    type: subtype,
                    ...arrayOfSpec
                })).validate((x)=>rangeValidate(x.length), "valid length"), value);
            }
        case "enum":
            if (matchValues.test(value)) {
                return defaultNullable(mod.literals(value.values[0], ...value.values), value);
            }
            return mod.unknown;
        case "pointer":
            return mod.unknown;
        case "union":
            if (matchUnion.test(value)) {
                return mod.some(...Object.entries(value.variants).map(([variant, spec])=>mod.shape({
                        [value.tag.id]: mod.literal(variant)
                    }).concat(typeFromProps(spec))));
            }
            return mod.unknown;
    }
    return mod.unknown;
}
function typeFromProps(valueDictionary) {
    if (!recordString.test(valueDictionary)) return mod.unknown;
    return mod.shape(Object.fromEntries(Object.entries(valueDictionary).map(([key, value])=>[
            key,
            guardAll(value)
        ])));
}
function unwrapResultType(res) {
    if ("error-code" in res) {
        throw new Error(res["error-code"][1]);
    } else if ("error" in res) {
        throw new Error(res["error"]);
    } else {
        return res.result;
    }
}
const exists = (effects, props)=>effects.metadata(props).then((_)=>true, (_)=>false);
const errorCode = (code, error)=>({
        "error-code": [
            code,
            error
        ]
    });
const error = (error)=>({
        error
    });
const ok = {
    result: null
};
const isKnownError = (e)=>e instanceof Object && ("error" in e || "error-code" in e);
const mod2 = {
    guardAll: guardAll,
    typeFromProps: typeFromProps,
    unwrapResultType: unwrapResultType,
    exists: exists,
    errorCode: errorCode,
    error: error,
    ok: ok,
    isKnownError: isKnownError
};
const asResult = (result)=>({
        result: result
    });
const noPropertiesFound = {
    result: {
        version: 2,
        data: {
            "Not Ready": {
                type: "string",
                value: "Could not find properties. The service might still be starting",
                qr: false,
                copyable: false,
                masked: false,
                description: "Fallback Message When Properties could not be found"
            }
        }
    }
};
const properties = async (effects)=>{
    if (await exists(effects, {
        path: "start9/stats.yaml",
        volumeId: "main"
    }) === false) {
        return noPropertiesFound;
    }
    return await effects.readFile({
        path: "start9/stats.yaml",
        volumeId: "main"
    }).then(mod1.parse).then(asResult);
};
const setConfig = async (effects, newConfig, dependsOn = {})=>{
    await effects.createDir({
        path: "start9",
        volumeId: "main"
    });
    await effects.writeFile({
        path: "start9/config.yaml",
        toWrite: mod1.stringify(newConfig),
        volumeId: "main"
    });
    const result = {
        signal: "SIGTERM",
        "depends-on": dependsOn
    };
    return {
        result
    };
};
const { any: any1, string: string1, dictionary: dictionary1 } = mod;
const matchConfig = dictionary1([
    string1,
    any1
]);
const getConfig = (spec)=>async (effects)=>{
        const config = await effects.readFile({
            path: "start9/config.yaml",
            volumeId: "main"
        }).then((x)=>mod1.parse(x)).then((x)=>matchConfig.unsafeCast(x)).catch((e)=>{
            effects.info(`Got error ${e} while trying to read the config`);
            return undefined;
        });
        return {
            result: {
                config,
                spec
            }
        };
    };
const getConfigAndMatcher = (spec)=>[
        async (effects)=>{
            const config = await effects.readFile({
                path: "start9/config.yaml",
                volumeId: "main"
            }).then((x)=>mod1.parse(x)).then((x)=>matchConfig.unsafeCast(x)).catch((e)=>{
                effects.info(`Got error ${e} while trying to read the config`);
                return undefined;
            });
            return {
                result: {
                    config,
                    spec
                }
            };
        },
        typeFromProps(spec)
    ];
function updateConfig(fn, configured, noRepeat, noFail = false) {
    return migrationFn(async (effects)=>{
        await noRepeatGuard(effects, noRepeat, async ()=>{
            let config = unwrapResultType(await getConfig({})(effects)).config;
            if (config) {
                try {
                    config = await fn(config, effects);
                } catch (e) {
                    if (!noFail) {
                        throw e;
                    } else {
                        configured = false;
                    }
                }
                unwrapResultType(await setConfig(effects, config));
            }
        });
        return {
            configured
        };
    });
}
async function noRepeatGuard(effects, noRepeat, fn) {
    if (!noRepeat) {
        return fn();
    }
    if (!await exists(effects, {
        path: "start9/migrations",
        volumeId: "main"
    })) {
        await effects.createDir({
            path: "start9/migrations",
            volumeId: "main"
        });
    }
    const migrationPath = {
        path: `start9/migrations/${noRepeat.version}.complete`,
        volumeId: "main"
    };
    if (noRepeat.type === "up") {
        if (!await exists(effects, migrationPath)) {
            await fn();
            await effects.writeFile({
                ...migrationPath,
                toWrite: ""
            });
        }
    } else if (noRepeat.type === "down") {
        if (await exists(effects, migrationPath)) {
            await fn();
            await effects.removeFile(migrationPath);
        }
    }
}
async function initNoRepeat(effects, migrations, startingVersion) {
    if (!await exists(effects, {
        path: "start9/migrations",
        volumeId: "main"
    })) {
        const starting = EmVer.parse(startingVersion);
        await effects.createDir({
            path: "start9/migrations",
            volumeId: "main"
        });
        for(const version in migrations){
            const migrationVersion = EmVer.parse(version);
            if (migrationVersion.lessThanOrEqual(starting)) {
                await effects.writeFile({
                    path: `start9/migrations/${version}.complete`,
                    volumeId: "main",
                    toWrite: ""
                });
            }
        }
    }
}
function fromMapping1(migrations, currentVersion) {
    const inner = fromMapping(migrations, currentVersion);
    return async (effects, version, direction)=>{
        await initNoRepeat(effects, migrations, direction === "from" ? version : currentVersion);
        return inner(effects, version, direction);
    };
}
const mod3 = {
    updateConfig: updateConfig,
    noRepeatGuard: noRepeatGuard,
    initNoRepeat: initNoRepeat,
    fromMapping: fromMapping1
};
const mod4 = {
    properties: properties,
    setConfig: setConfig,
    getConfig: getConfig,
    getConfigAndMatcher: getConfigAndMatcher,
    migrations: mod3
};
const setConfig1 = mod4.setConfig;
const { shape: shape1, number: number1, boolean: __boolean1, string: string2 } = mod;
const matchLightningdConfig = shape1({
    advanced: shape1({
        "clams-remote-websocket": __boolean1
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
            if (!config.advanced["clams-remote-websocket"]) {
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
            config.advanced["clams-remote-websocket"] = true;
            return {
                result: config
            };
        }
    }
};
const getConfig1 = mod4.getConfig({});
const properties1 = mod4.properties;
const migration = mod4.migrations.fromMapping({}, "1.0.0.1");
const main = async (effects)=>{
    await effects.runDaemon({
        command: "docker_entrypoint.sh",
        args: []
    }).wait();
    return mod2.ok;
};
export { setConfig1 as setConfig };
export { dependencies as dependencies };
export { getConfig1 as getConfig };
export { properties1 as properties };
export { migration as migration };
export { main as main };