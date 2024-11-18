from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from webdriver_manager.firefox import GeckoDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options

# Configurar opções do Firefox
firefox_options = Options()
firefox_options.add_argument("--headless")  # Opcional: roda o Firefox em modo headless (sem interface gráfica)

# Inicializar o driver do Firefox
driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=firefox_options)

# Abrir uma página como exemplo
driver.get("http://example.com")

# Fazer algo com o driver (exemplo)
print(driver.title)

# Fechar o driver após o uso
driver.quit()
