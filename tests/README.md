## For running tests
In a hurry? First be sure that `docker-compose up` is running and then just do:
```bash
docker-compose exec app bash -c "flake8; black --diff --check .; pytest"
```

**Consider always running these checks before submitting a Pull-Request.**

If you want, you can install locally the modules needed, but your mileage may vary

- install:

```bash
pip install pytest pytest-cov python-dotenv black flake8
```

- run them:
```bash
#Flake8
flake8

#Black
black --diff --check

# Py.Test
pytest --setup-show -v
```

### Using coverage
- Install: `pip install process-tests gunicorn`
- Create file `docker-compose.override.yml` containing:
```yaml
version: '3.8'
services:
   db:
      ports:
      - 5432:5432
```
- Start `db` container with `postgres` port 5432 exposed (`docker-compose.override.yml` will be _automagically_ loaded):
```bash
docker-compose up -d db
```
Then run:
```bash
APP_ENV=coverage pytest --cov views --cov db --cov-report term-missing:skip-covered -sv
```
which should show a coverage summary at the end.
### Using Tox
Install it with:
```bash
pip install tox
```
and run with:
```bash
tox --skip-pkg-install
```
However, binary `pysam` (installed via `pip`) is not working, so some tests will fail.

Yet, one can still test code format with:
```bash
tox --skip-pkg-install -e black,flake8
```
**Consider always running these checks before submitting a Pull-Request.**
