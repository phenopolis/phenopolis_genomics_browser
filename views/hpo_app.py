'''
this differs from hpo in that it deals with common logic in HPO queries
'''
from views import *
import sqlite3


@app.route('/<language>/hpoApp/hpoName/<hpo_id>')
@app.route('/hpoApp/hpoName/<hpo_id>')
def hpo_name(hpo_id, language='en'):
    c, fd, = sqlite3_ro_cursor(app.config['HPO_DB'])
    if not hpo_id.startswith('HP:'):
        c.execute("select * from hpo where hpo_name=? limit 1", (hpo_id,))
    else:
        c.execute("select * from hpo where hpo_id=? limit 1", (hpo_id,))
    res = [dict(zip([h[0] for h in c.description], r))
           for r in c.fetchall()][0]
    hpo_id = res['hpo_id']
    hpo_name = res['hpo_name']
    sqlite3_ro_close(c, fd)
    return json.dumps({'hpo_id': hpo_id, 'hpo_name': hpo_name})

# need a class to handle hpo logic
@app.route('/<language>/hpoApp/hpoMinGraph/<hpo_list>')
@app.route('/hpoApp/hpoMinGraph/<hpo_list>')
def hpo_min_graph(hpo_list, language='en'):
    hpo_list = hpo_list.split(',')
    Hpo = HPO()
    result = Hpo.get_min_graph(hpo_list)
    return json.dumps(result)


class HPO:
    def __init__(self):
        # conn is a sqlite connection
        self.conn = sqlite3.connect(app.config['HPO_DB'])

    def get_ancestors(self, hpo_id, result=None):
        if result is None:
            result = []
        cursor = self.conn.cursor()
        # get header
        sql = 'PRAGMA table_info(hpo)'
        cursor.execute(sql)
        header = [i[1] for i in cursor.fetchall()]

        # find record
        sql = 'SELECT * FROM hpo WHERE hpo_id = ?'
        cursor.execute(sql, (hpo_id,))
        record = dict(zip(header, cursor.fetchone()))
        if record['hpo_ancestor_ids']:
            ancestors = record['hpo_ancestor_ids'].split(';')
            result.extend(ancestors)
            for anc in ancestors:
                return self.get_ancestors(anc, result)
        else:
            return result

    def get_min_graph(self, hpo_list):
        '''
        get a miniminsed graph given a hpoList. For rendering a node graph.
          e.g.
          ```
          this.getMinGraph(['HP:0007754','HP:0000505','HP:0000510'])
          ```
          returns
          [
            {
              "id": "HP:0007754", 
              "is_a": "HP:0000556"
            }, 
            {
              "id": "HP:0000556", 
              "is_a": "HP:0000478"
            }, 
            {
              "id": "HP:0000478", 
              "is_a": null
            }, 
            {
              "id": "HP:0000505", 
              "is_a": "HP:0000478"
            }, 
            {
              "id": "HP:0000510", 
              "is_a": "HP:0000556"
            }
          ]
        '''
        cursor = self.conn.cursor()
        # get header
        sql = 'PRAGMA table_info(hpo)'
        cursor.execute(sql)
        header = [i[1] for i in cursor.fetchall()]
        if (len(hpo_list) == 1):
            print 'here'
            result = [{'id': hpo_list[0], 'is_a': None}]
            sql = 'SELECT * FROM hpo WHERE hpo_id = ?'
            cursor.execute(sql, (hpo_list[0],))
            record = dict(zip(header, cursor.fetchone()))
            if record['hpo_ancestor_ids']:
                result[0]['is_a'] = record['hpo_ancestor_ids'].split(';')
                for anc in result[0]['is_a']:
                    result.append({'id': anc, 'is_a': None})
            return result

        ancestor_list = []
        for h in hpo_list:
            ancestors = self.get_ancestors(h)
            ancestor_list.append([h] + ancestors)
        ancestor_count = counter(ancestor_list)
        # sort hpo list and ancestor list so that more specific terms come first
        sorted_index = get_sorted_index(hpo_list, ancestor_count)

        result, seen = [], set()
        for hpo_index in sorted_index:
            count = ancestor_count[hpo_list[hpo_index]]
            for anc_index, ancestor in enumerate(ancestor_list[hpo_index]):
                if anc_index == 0 and not ancestor in seen:
                    result.append({'id': ancestor, 'is_a': None})
                else:
                    if ancestor_count[ancestor] > count:
                        count = ancestor_count[ancestor]
                        if result[-1]['is_a'] is None:
                            result[-1]['is_a'] = ancestor
                        if ancestor not in seen:
                            result.append({'id': ancestor, 'is_a': None})
                            seen.add(ancestor)
        return result


def counter(data):
    # given a list (of lists), return elements as key, counts as value
    result = {}

    def inner_counter(e):
        if e in result:
            result[e] += 1
        else:
            result[e] = 1

    for ele in data:
        if isinstance(ele, (list, tuple)):
            for e in ele:
                inner_counter(e)
        else:
            inner_counter(ele)
    return result


def get_sorted_index(hpos, count):
    indexed_test = [{'ind': i, 'val': e} for i, e in enumerate(hpos)]
    # sort index/value couples, based on values
    indexed_test = sorted(indexed_test, key=lambda x: count[x['val']])
    # make list keeping only indices
    return [i['ind'] for i in indexed_test]
