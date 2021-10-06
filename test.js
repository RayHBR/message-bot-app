var row = 'aaa bbb ccc'
var rows = row.split(' ');
var str = '';
var temp = '';
var temp_number;
for (i=0;i<rows.length;i++){
    temp += rows[i] + ' ';
    if (temp.length > 8){
        str += rows[i] + ' ';
    }
}
console.log(str)