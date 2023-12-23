# vsc-vd
vsc-vd (VSCode Vendetta Debugger) is a debugger for Vendetta that's meant to be used in the VSCode integrated terminal. It allows you to write React and TypeScript which will automatically be transpiled before being sent to the WebSocket debugger.
# Getting Started
1. Clone the repo ( `git clone https://github.com/fres621/vsc-vd` )
2. Edit the file `workspace/index.tsx`
3. Open the folder in vscode
4. Run `pnpm start` from the vscode integrated terminal
5. Connect to the URL given in your Vendetta debug WebSocket

# Usage
- Press <kbd>ENTER</kbd> to send `workspace/index.tsx` to the WebSocket client. React and TypeScript will be transpiled. You can import node modules as long as they're installed in the project.
- Press <kbd>R</kbd> to see in the console the transpiled code that will be sent to the websocket
- This debugger creates logs every session. Press <kbd>L</kbd> to start a new log file without closing the current session.
# 
`declarations.d.ts` includes devkit-plus types so vscode doesn't complain when you use it :3