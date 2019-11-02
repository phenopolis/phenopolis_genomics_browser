import requests

home='http://127.0.0.1:5000'

with requests.Session() as session:
    p=session.post(home+'/login',data={'name':'demo','password':'demo123'})
    print(p.json())

    p=session.get(home+'/gene/ENSG00000119685')
    print(p.json())


