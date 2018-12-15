class VCFEntry(object):
    def __init__(self, vkey, ssid, pid, ac, passFilter=1, qual=-1, gq=-1, dp=-1, ad=-1):
        self.vkey = vkey
        if not ssid:
            self.ssid = "UNKNOWN"
        else:
            self.ssid = ssid
        self.pid = pid
        self.ac = ac
        self.passFilter = passFilter
        self.qual = qual
        self.gq = gq
        self.dp = dp
        self.ad = ad

    def __repr__(self):
        return "VCFEntry: (" + ', '.join([str(x) for x in [self.vkey, self.ssid, self.pid, self.ac, self.passFilter, self.qual, self.gq, self.dp, self.ad]]) + ")"
    def __str__(self):
        return '\t'.join([str(x) for x in [self.vkey, self.ssid, self.pid, self.ac, self.passFilter, self.qual, self.gq, self.dp, self.ad]])
    
    def __eq__(self, other):
        return (isinstance(other, self.__class__) and self.__dict__ == other.__dict__)
    def __ne__(self, other):
        return not self.__eq__(other)

    def sameEntry(self, other):
        return (isinstance(other, self.__class__) and self.vkey == other.vkey and self.ssid == other.ssid and self.pid == other.pid)

