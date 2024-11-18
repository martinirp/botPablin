from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
import time
import pickle

# Usar o webdriver-manager para baixar e configurar o chromedriver automaticamente
driver = webdriver.Chrome(ChromeDriverManager().install())

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
