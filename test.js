
var a = {
    "users": [
        {
            "userID": 1123213,
            "point": 100
        }
    ]
}
console.log(JSON.parse(JSON.stringify(a)).users)