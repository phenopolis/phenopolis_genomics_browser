class PhenopolisException(Exception):

    http_status = None

    def __init__(self, message, http_status):
        super().__init__(message)
        self.http_status = http_status
