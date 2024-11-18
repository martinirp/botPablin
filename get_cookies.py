from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import pickle

# Caminho do ChromeDriver
chromedriver_path = '/usr/local/bin/chromedriver'  # Modifique conforme o seu caso

# Inicializar o navegador
options = webdriver.ChromeOptions()
driver = webdriver.Chrome(executable_path=chromedriver_path, options=options)

# Acessar o YouTube
driver.get("https://www.youtube.com")

# Esperar para o usuário fazer login manualmente
print("Por favor, faça o login manualmente no YouTube. O script irá esperar por 30 segundos após a página carregar.")
time.sleep(10)  # Dê tempo suficiente para você fazer o login

# Após login, você pode interagir com o navegador para pegar os cookies

# Salvar os cookies após login
cookies = driver.get_cookies()

# Salvar os cookies em um arquivo
with open("youtube_cookies.pkl", "wb") as cookie_file:
    pickle.dump(cookies, cookie_file)

print("Cookies salvos com sucesso!")

# Fechar o navegador
driver.quit()
