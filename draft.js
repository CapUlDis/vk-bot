const stringTable = require('string-table');

var users = [
    { 'name': 'Dan', 'gender': 'M', 'age': 29 },
    { 'name': 'Adam', 'gender': 'M', 'age': 31 },
    { 'name': 'Lauren', 'gender': 'F', 'age': 33 }
];

var table = stringTable.create(users, { capitalizeHeaders: true });

console.log(table);