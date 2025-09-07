# Terminal Monitoring Rules

## Rule: Always Check Terminal Output

When running commands or starting development servers, always:

1. **Monitor for Active Processes**: Check if any processes are already running on the required ports
2. **Read Error Messages**: Carefully parse any error output in the terminal
3. **Identify Port Conflicts**: Look for "EADDRINUSE" or "port already in use" errors
4. **Check Process Status**: Verify if development servers, databases, or other services are running
5. **Parse Build Errors**: Read TypeScript, ESLint, or compilation errors completely
6. **Monitor Resource Usage**: Check for memory or disk space issues

## Common Terminal Patterns to Watch For

### Port Conflicts
- `Error: listen EADDRINUSE: address already in use :::3000`
- `Port 3000 is already in use`
- `Something is already running on port 3000`

### Build/Compilation Errors
- `Type error:` followed by TypeScript errors
- `Module not found:` for missing dependencies
- `SyntaxError:` for code syntax issues
- `Failed to compile` messages

### Database Issues
- `EBUSY: resource busy or locked` for database file locks
- `Database connection failed`
- `SQLite database is locked`

### Process Management
- Look for process IDs (PID) in output
- Check for "server started" or "ready" messages
- Monitor for crash or exit codes

## Actions to Take

1. **If Port Conflict**: Kill existing process or use different port
2. **If Build Error**: Fix the specific error mentioned in output
3. **If Database Lock**: Close existing connections or restart
4. **If Process Running**: Check if it's the intended process or terminate if needed

## Terminal Reading Protocol

1. Read the ENTIRE terminal output, not just the last line
2. Look for both stdout and stderr messages
3. Check for warning messages that might indicate future problems
4. Identify the root cause, not just symptoms
5. Provide specific solutions based on the exact error messages seen