

def all(element, nodename):
    path = './/%s' % nodename
    result = element.findall(path)
    return result