import speech_recognition as sr
import pyttsx3
import subprocess
import requests
from bs4 import BeautifulSoup
import json

# Initialize the recognizer and TTS engine
recognizer = sr.Recognizer()
engine = pyttsx3.init()

def speak(text):
    engine.say(text)
    engine.runAndWait()

def listen():
    with sr.Microphone() as source:
        print("Listening...")
        audio = recognizer.listen(source)
        command = ""
        try:
            command = recognizer.recognize_google(audio)
            print(f"You said: {command}")
        except sr.UnknownValueError:
            speak("Sorry, I didn't catch that.")
        return command.lower()

def search_web(query):
    speak("Let me search the web.")
    url = f"https://www.google.com/search?q={query}"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Find the first paragraph of the search result
    for paragraph in soup.find_all('p'):
        return paragraph.get_text()

def remember_command(command, response):
    # Store the command and response in a JSON file
    try:
        with open("commands_memory.json", "r") as f:
            memory = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        memory = {}

    memory[command] = response
    
    with open("commands_memory.json", "w") as f:
        json.dump(memory, f)

def activate_jarvis():
    speak("Jarvis activated. How can I assist you?")
    while True:
        command = listen()
        if 'stop' in command or 'exit' in command:
            speak("Goodbye!")
            break
        elif 'open notepad' in command:
            subprocess.run(["notepad"])
            speak("Opening Notepad.")
        elif 'open calculator' in command:
            subprocess.run(["calc"])
            speak("Opening Calculator.")
        elif 'what time is it' in command:
            from datetime import datetime
            now = datetime.now()
            current_time = now.strftime("%H:%M")
            speak(f"The current time is {current_time}.")
        else:
            speak(f"I don't know how to {command}. Would you like me to learn how to do it?")
            permission = listen()
            if 'yes' in permission:
                response = search_web(command)
                speak(f"I found this information: {response}. Would you like me to remember this?")
                remember_permission = listen()
                if 'yes' in remember_permission:
                    remember_command(command, response)
                    speak("I've remembered how to do that!")
                else:
                    speak("Okay, I won't remember that.")
            else:
                speak("Okay, I won't learn how to do that.")

# Main Loop to listen for "Jarvis"
while True:
    command = listen()
    if 'jarvis' in command:
        activate_jarvis()
