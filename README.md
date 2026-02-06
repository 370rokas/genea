# Genea svetainė

Sistema skirta šaltinių ir kt. informacijos kaupimui.

## Naudojimo instrukcijos

Prieš paleidžiant, reikia pasiruošti PostgreSQL duombazę, ją paruošti naudojimui paleidžiant `database_schema.sql` kodą.

Aplikacijai reikia šių aplinkos kintamųjų, juos galima nustatyti `.env` faile:
```bash
DATABASE_URL # PostgreSQL prisijungimo URI
AUTH_SECRET # Atsitiktinis kodas, naudojamas sesijų šifravimui
MAILERSEND_API_KEY # API Raktas El. Pašto pranešimams (neprivaloma)
```

### Docker paleidimas
Rekomenduojama naudoti viešai svetainės versijai.

```yaml
services:
  genea:
    image: ghcr.io/370rokas/genea:latest
    container_name: genea
    restart: always
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
```

### Vietinis paleidimas
Rekomenduojama naudoti testavimui ir kūrimui.

1.  Nuklonuoti kodą:
```bash
git clone [https://github.com/370rokas/genea.git](https://github.com/370rokas/genea.git)
cd genea
```

3.  Įdiegti reikalavimus:
```bash
npm install
```

4.  Paleisti dev aplinką:
```bash
npm run dev
```

5.  Kompiliuoti svetainę:
```bash
npm run build # kompiliuoti
npm run start # paleisti
```
