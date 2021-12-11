Clear state go o A first. We can never reach B. We can

|from | to | result |
|-----|----|--------|
| A | B | A  |
| A | C | C  |
| C | B | C  |
| C | A | A  |


Clear state go o B first. We can reach it, but then after visiting A
we get always redirected to the previous state A instead of reaching B.

|from | to | result |
|-----|----|--------|
| B | A | A  |
| A | B | A  |

