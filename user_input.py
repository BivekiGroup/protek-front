def main():
    while True:
        print("\n" + "="*50)
        user_input = input("Please provide feedback or next task (type 'stop' to exit): ").strip()
        
        if user_input.lower() == 'stop':
            print("Exiting task loop. Thank you!")
            break
        elif user_input.lower() == '':
            print("Please provide some input or type 'stop' to exit.")
            continue
        else:
            print(f"\nReceived input: {user_input}")
            print("Processing your request...")
            # Here the main process would handle the user's input
            return user_input

if __name__ == "__main__":
    result = main()
    if result and result.lower() != 'stop':
        print(f"Next task received: {result}") 