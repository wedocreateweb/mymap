import openai
import json

def load_api_key():
    """
    Attempts to load the OpenAI API key in the following order:
    1. From the 'config.json' file, if it exists.
    2. Prompts the user for an API key at runtime.

    Returns:
    - str: The API key if found, or None if not found.
    """
    # 1. Try loading the API key from config.json if it exists
    try:
        with open("config.json", "r") as config_file:
            config = json.load(config_file)
            api_key = config.get("OPENAI_API_KEY")
            if api_key:
                print("Loaded API key from config.json.")
                return api_key
    except FileNotFoundError:
        print("config.json not found, proceeding to prompt for API key.")

    # 2. Prompt the user for the API key
    api_key = input("Enter your OpenAI API key: ")
    return api_key

def get_openai_response(prompt, model="gpt-3.5-turbo", max_tokens=100, temperature=0.7):
    """
    Sends a prompt to the OpenAI API and returns the model's response.
    
    Parameters:
    - prompt (str): The text prompt to send to the model.
    - model (str): The model to use (e.g., "gpt-4" or "gpt-3.5-turbo").
    - max_tokens (int): The maximum number of tokens in the response.
    - temperature (float): Controls the randomness of the output (0 = deterministic, 1 = creative).

    Returns:
    - str: The model's response.
    """
    try:
        # Make the API request
        response = openai.ChatCompletion.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=temperature
        )
        # Extract the response content
        return response['choices'][0]['message']['content'].strip()
    
    except Exception as e:
        return f"An error occurred: {e}"

if __name__ == "__main__":
    # Load the API key
    openai.api_key = load_api_key()

    # Check if the API key was successfully loaded
    if not openai.api_key:
        print("API key not provided. Exiting.")
    else:
        # Prompt for user input
        user_prompt = input("Enter your prompt for OpenAI: ")
        # Get the response
        response = get_openai_response(user_prompt)
        # Print the result
        print("Response from OpenAI:", response)
