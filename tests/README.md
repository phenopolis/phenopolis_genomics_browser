## For running tests
For the moment, these unit tests need Demo DB from docker app running, then:

- install:

```bash
pip install pytest pytest-cov python-dotenv
```

- run it:
```bash
python -m pytest --setup-show --cov -v
```

### Using Tox
Install it with:
```bash
pip install tox
```
and run with:
```bash
tox --skip-pkg-install
```
However, binary `pysam` (installed via `pip`) is not working, so 2 tests will fail
and hence coverage for `variants.py` will be reduced.

Yet, one can still test code format with:
```bash
tox --skip-pkg-install -e black,flake8
```
**Consider always running `tox` before submitting a Pull-Request.**
