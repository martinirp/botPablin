from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time
import json

# Configurações do navegador headless
options = webdriver.ChromeOptions()
options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

service = Service('/usr/bin/chromedriver')
driver = webdriver.Chrome(service=service, options=options)

try:
    # Abrir a página de login do Google
    driver.get("https://accounts.google.com/signin")

    # Localizar os campos de login e senha
    email_input = driver.find_element(By.ID, "identifierId")
    email_input.send_keys("lucasmartini672@gmail.com")
    email_input.send_keys(Keys.RETURN)
    time.sleep(2)  # Aguarde a próxima página carregar

    # Campo de senha
    password_input = driver.find_element(By.NAME, "password")
    password_input.send_keys("C7kgxmwt!@#")
    password_input.send_keys(Keys.RETURN)
    time.sleep(5)  # Aguarde o login completar

    # Salvar os cookies
    cookies = driver.get_cookies()
    with open("cookies.json", "w") as file:
        json.dump(cookies, file)

    print("Cookies salvos com sucesso em 'cookies.json'")

except Exception as e:
    print(f"Erro: {e}")

finally:
    driver.quit()
