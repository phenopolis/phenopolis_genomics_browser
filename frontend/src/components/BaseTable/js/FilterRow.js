import React from 'react';

export const FilterRow = (filters, rows) => {
  if (filters.length === 0) {
    return rows;
  }

  var tmpFilteredData = rows.filter((item, rowIndex) => {
    var tmpJudge = new Array(filters.length).fill(true);

    Array.prototype.forEach.call(filters, (filter, index) => {
      switch (filter.operation) {
        case '>':
          if (Number(item[filter.column.key]) > Number(filter.value)) {
          } else {
            tmpJudge[index] = false;
          }
          break;
        case '≥':
          if (Number(item[filter.column.key]) >= Number(filter.value)) {
          } else {
            tmpJudge[index] = false;
          }
          break;
        case '<':
          if (Number(item[filter.column.key]) < Number(filter.value)) {
          } else {
            tmpJudge[index] = false;
          }
          break;
        case '≤':
          if (Number(item[filter.column.key]) <= Number(filter.value)) {
          } else {
            tmpJudge[index] = false;
          }
          break;
        case '=':
          if (typeof item[filter.column.key] !== 'object') {
            if (
              RegExp(filter.value.toUpperCase().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).test(
                item[filter.column.key].toString().toUpperCase()
              )
            ) {
            } else {
              tmpJudge[index] = false;
            }
          } else {
            if (
              (typeof item[filter.column.key][0] === 'object') &
              (item[filter.column.key][0] !== null)
            ) {
              let displays = item[filter.column.key].filter((chip) => {
                return RegExp(
                  filter.value.toUpperCase().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
                ).test(chip.display.toUpperCase());
              });
              if (displays.length > 0) {
              } else {
                tmpJudge[index] = false;
              }
            } else {
              if (
                RegExp(filter.value.toUpperCase().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).test(
                  item[filter.column.key].join(',').toUpperCase()
                )
              ) {
              } else {
                tmpJudge[index] = false;
              }
            }
          }
          break;
        case '==':
          if (
            JSON.stringify(item[filter.column.key].toString().toUpperCase()) ===
            JSON.stringify(filter.value.toUpperCase())
          ) {
          } else {
            tmpJudge[index] = false;
          }
          break;

        case '⊂':
          if (typeof item[filter.column.key] !== 'object') {
            tmpJudge[index] = false;
            break;
          } else {
            if (
              (typeof item[filter.column.key][0] === 'object') &
              (item[filter.column.key][0] !== null)
            ) {
              let displays = item[filter.column.key].filter((chip) => {
                return filter.value.includes(chip.display);
              });

              if (displays.length > 0) {
              } else {
                tmpJudge[index] = false;
              }
            } else {
              tmpJudge[index] = false;
            }
          }
          break;

        case '⊄':
          if (typeof item[filter.column.key] !== 'object') {
            break;
          } else {
            if (
              (typeof item[filter.column.key][0] === 'object') &
              (item[filter.column.key][0] !== null)
            ) {
              let displays = item[filter.column.key].filter((chip) => {
                return filter.value.includes(chip.display);
              });
              if (displays.length > 0) {
                tmpJudge[index] = false;
              } else {
              }
            } else {
            }
          }
          break;
        case '∅':
          if (typeof item[filter.column.key] !== 'object') {
            if (
              (item[filter.column.key] === '') |
              (item[filter.column.key] === null) |
              (item[filter.column.key] === undefined)
            )
              tmpJudge[index] = false;
          } else {
            if (item[filter.column.key].length === 0) {
              tmpJudge[index] = false;
            } else {
              if (
                (typeof item[filter.column.key][0] === 'object') &
                (item[filter.column.key][0] !== null)
              ) {
                let displays = item[filter.column.key].filter((chip) => {
                  return chip.display !== '';
                });
                if (displays.length === 0) {
                  tmpJudge[index] = false;
                }
              } else {
                let displays = item[filter.column.key].filter((chip) => {
                  return chip !== '';
                });
                if (displays.length === 0) {
                  tmpJudge[index] = false;
                }
              }
            }
          }
          break;
        default:
          break;
      }
    });

    let judge = null;
    if (filters.length === 0) {
      judge = true;
    } else {
      var stringForEval = '';
      for (let i = 0; i < filters.length; i++) {
        stringForEval = stringForEval + tmpJudge[i];

        if (i !== filters.length - 1) {
          if (filters[i].andor === 'and') {
            stringForEval = stringForEval + ' & ';
          } else {
            stringForEval = stringForEval + ' | ';
          }
        }
      }
      // TODO - remove eval
      // eslint-disable-next-line
      judge = eval(stringForEval);
    }
    return judge;
  });

  return tmpFilteredData;
};
