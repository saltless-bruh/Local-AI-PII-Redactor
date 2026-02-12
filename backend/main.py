import sys
import json
import logging

# Configure logging to stderr so it doesn't pollute stdout (which is used for IPC)
logging.basicConfig(stream=sys.stderr, level=logging.INFO)

def main():
    logging.info("Python Backend Started. Waiting for commands on stdin...")
    
    while True:
        try:
            # Read line from stdin
            line = sys.stdin.readline()
            if not line:
                break
                
            # Parse JSON
            try:
                data = json.loads(line)
            except json.JSONDecodeError:
                logging.error(f"Invalid JSON received: {line}")
                continue
                
            command = data.get("command")
            
            # Handle Commands
            response = {}
            if command == "ping":
                response = {
                    "status": "success", 
                    "message": "pong", 
                    "version": "0.1.0-alpha"
                }
            else:
                response = {
                    "status": "error", 
                    "message": f"Unknown command: {command}"
                }
            
            # Write response to stdout as a single line JSON
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush() # Vital for real-time IPC
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            logging.error(f"Critical Error: {e}")
            break

if __name__ == "__main__":
    main()
