# Instructions for Clams Remote

You can use Clams Remote on your Start9 device using either Tor Browser or by using a standard browser on your LAN.

When using Tor Browser, go to Clams Remote->Interfaces and copy the Tor Address. Paste this into Tor Browser and bookmark it. Clams Remote should load. Next you will want to provide Clams Remote with the connection and rune information so the wallet can control your Core Lightning Node. In the Clams Remote app in Tor Browser, go to Wallets->Add->Core Lightning. Next click the Advanced link, then select "Direct Connection", then choose "ws".

Next you need to paste in the Address and Rune information. This information can be found in your Core Lightning Properties section on your Start9. Copy the "Clams Remote Websocket URI" then paste it into Clams Remote in the Address field. The Rune from your Start9 can be found in Core Lightning->Actions->Generate Rune. Paste it into the Rune field in Clams Remote, then click "Update". Clams Remote should update to "Connected" if the connection is successful.

If you're on your LAN, start from the Clams Remote app on your Start9 and copy the Interfaces->LAN Address and paste it into a standard browser. Clams Remote should load in your browser. Add a node in similar way as with Tor Browser, except change any .onion address to a .local, and change the "ws" to "wss".