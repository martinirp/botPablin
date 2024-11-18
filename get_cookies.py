import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from dotenv import load_dotenv

# Carregar variáveis do arquivo .env
load_dotenv()
email = os.getenv("EMAIL")
senha = os.getenv("SENHA")

# Verificar se as variáveis de ambiente foram carregadas corretamente
if not email or not senha:
    print("Erro: As variáveis de ambiente não foram carregadas corretamente.")
    exit(1)

# Configurações do ChromeDriver
options = webdriver.ChromeOptions()
# Remover a linha abaixo para rodar com a interface visível
# options.add_argument("--headless")  

options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

# Defina o caminho correto do seu chromedriver
service = Service('/usr/bin/chromedriver')  # Ajuste o caminho se necessário
driver = webdriver.Chrome(service=service, options=options)

try:
    # Acesse a página de login
    driver.get("https://accounts.google.com/signin")

    # Preencha o e-mail
    email_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "identifier"))
    )
    email_input.send_keys(email)
    email_input.send_keys(Keys.RETURN)

    # Aguarde a página de senha carregar
    senha_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "password"))
    )
    senha_input.send_keys(senha)
    senha_input.send_keys(Keys.RETURN)

    # Aguarde o redirecionamento para a próxima página
    WebDriverWait(driver, 10).until(
        EC.url_contains("myaccount.google.com")  # Ajuste conforme necessário
    )

    print("Login concluído com sucesso!")

except Exception as e:
    print(f"Erro: {e}")

finally:
    # Aguardar a interação manual antes de fechar o navegador
    input("Pressione Enter para fechar o navegador...")
    driver.quit()
