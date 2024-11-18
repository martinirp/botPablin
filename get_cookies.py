from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time
import pickle

# Configuração do caminho do Chromium (via Snap)
chrome_options = Options()
chrome_options.binary_location = "/snap/bin/chromium"  # Caminho correto do Chromium no Snap

# Adiciona a opção --no-sandbox
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')  # Outra opção para evitar problemas de memória

# Usar o webdriver-manager para baixar e configurar o chromedriver automaticamente
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

# Acessar o YouTube
driver.get("https://www.youtube.com")

# Esperar para o usuário fazer login manualmente
print("Por favor, faça o login manualmente no YouTube. O script irá esperar por 30 segundos após a página carregar.")
time.sleep(10)  # Dê tempo suficiente para você fazer o login

# Salvar os cookies após login
cookies = driver.get_cookies()

# Salvar os cookies em um arquivo
with open("youtube_cookies.pkl", "wb") as cookie_file:
    pickle.dump(cookies, cookie_file)

print("Cookies salvos com sucesso!")

# Fechar o navegador
driver.quit()
