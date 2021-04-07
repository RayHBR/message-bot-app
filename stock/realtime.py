import sys
import json
from twstock import realtime
rt = realtime.get('2330')
print(json.dumps(rt))