'use strict'

const reachableUrl = require('reachable-url')
const got = require('got')
const test = require('ava')

const contentLength = require('..')

test('.fromUrl', async t => {
  {
    const url = 'https://httpbin.org/status/404'
    t.is(await contentLength(url), 0)
  }
  {
    const url = 'https://microlink.io/favicon.ico'
    t.is(await contentLength(url), 34494)
  }
  {
    const url = 'https://cdn.microlink.io/logo/logo.png'
    t.is(await contentLength(url), 2784)
  }
  {
    const url =
      'https://mirrors.dotsrc.org/blender/blender-demo/movies/ToS/tearsofsteel_4k.mov?fromUrl'
    t.is(await contentLength(url), 6737592810)
  }
})

test('.fromDataUri', async t => {
  const dataUri =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAp4AAAHWBAMAAAAsu5Q8AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAkUExURUdwTHZSo2ZOo2dPpOtAe+pBfGVOo+pAfO1BfGZOo+pAe2VOoxSB7oUAAAAKdFJOUwAh3U5sk7TEPIeCD/mtAAAKwUlEQVR42u3dQWscxxYF4G7NaDRjb9p24sTyxokhYGYzsSEQZqOAjYJWCli8h1ayAwajjQwWDrOagEOEVrIMBqFNDBIStbJHMGD6z8W2nMd7fqmqjum+de/ROX9A3Z/q1q2q7payjGGYCvny9p2VJ1qzcvf2r5Ywn66MnPYcbf5YGNHUj/mB9G5BzZpFlWvmi85WDseaOT8bOXP5t17O353FHGidRRedzRzqBF1yVnM0Jic66KKzHHUl/7uznQNdnJ87R9D60nb280iR5yqApxtz8qy3J2nhnHUY+UXJGcgIxNMtqPDcRuHUUfFdh5MN7jPr3XcWbEa15phLT6xFKNbwTD9AwYancwWHZ615yeGJM0DbeJxJz5m2AT2PEu7cHWKWk3nOQXoesBthrOnbmJzJOtI2qGeqjjQC9UxU8Kjl7twfSTznYT0PWe72Cx633NM89zgH7Jmi4FeBPR337tb38LPQni+5WjI+gUJPn/Kn9NjTp/wEOgvu+QdXn6YPlbfBPaXP7EbgnsJb+ArtaPPultbc/pe2hhQ9DNn8IdOc7qKuhhR7svlTpj3dkaaGFNkdLWSZdVDZHdKSec7odxR62vujzEbaehq8pqXwp+cLLUXW1XSU0NChjuQzj1mAao/dh+SCaU7dywD1D1DJN+nPaTrZbmiASraBeZDhGVqoSC5AtwGae6zSJE+YllS9CdDQSkXFNG6s3EMFXyi4iCNrnIGpS3BoqFhkNL30W1DguWHOs63gRDlX9J5Kc2ND7l66OO0o0As2FHja4/SvVRR4Hhn03E7v2aanjOehQc/59Ad2UJ7n6ElPetKTnvSkJz3pSU960pOe9KQnPelJT3rSk570pCc96UlPetKTnvSkJz3pSU960pOe9KQnPelJT3rSk570pCc97Xl2Nz15TM8zH3rSk570pCc96UlPhp70pCdDT3rSk570pCc96elLfuGW0nx7wZrnpb37pepMHj4vrHjmL/qlhXzzzIKnFc13mT5X7/ldaSrTgWrP1m5pLc8Ve17pl/Zyo9Dq+V1pMiI1/wmeRjnfLp4GGj1vlmYz2dHnaZhTYoT+U8/LpelMC12eV8qSoPV5tvrWPcsbijzz9dJ+7unxvFkiZKDFswfBWU6VeOZ9DM/yug7PYYmSgQbPHgxn+UaD5z6OZ7mW3rMDxNngqr6qJ0wzOs1XqT0vQnGWkyKxJ9bwbG6AVvS8DMbZ2ACt6LmO5tnUAK3m2YHjLCcpPfGGZ1Nr0EqeLUDOhjZJlTyHiJ7N7OKreIKt5f/K61SeHUjOZjpSFc99TM9GOlIFzxYoZ3mSxnMG1bOJPVIFT9RyL8udFJ45LGcTBR/3nMH1nKTwxC33Jgo+6glc7k0s6aOePWTPN/KeV5E9y0Lccx/ac03aE3r6bGACjXn2sD2n0p7Y02f9E2jMcx/cc0fYsw/ueU3WE7wd1b+Fj3hWOZr/+oHS3O/LN6SI5/nokYLw3z/4Z7m0K92QIp7DyNX8rFnzvei6bEOKeEau5lmmPvm+aEOKeIZr3QDn2+xK7pDCnuFHcfcyG1kXbPBhz57048FGEvxKcirpGXrW0finuvXlstwzj7DnVeG3AVJUfCHoORQ8mWkyHbEFU9hzH2N4BgfomqDnuuSj1kQD9Jqgp+STwWZX9f4W/0rOM3C6NLDlGegEr+U8WxjdKFzwJxo8T6x55kLP4IOePZDuHmytUznPDsz0GZhAJ3Ke/u1mraW45UudP2VGs2etNSLz/zd7ImPjEz1P7Hm2FHieF1mzyXjmmj1f2fPMZA6Ygp5XkTz7ij2vIXkO6Fnrgp6e9KQnPelJT3rSk570pCc96UlPetKTnvSkJz3pSU960pOe9KQnPelJT3rSk570pCc96UlPetKTnvSkJz3pSU960pOe9KQnPelJT3rSk570pCc96UlPetKTnvSkJz3fZ56eMp4bYp5d3yUcGfTcVuzpDHouafYs7HmupvfMvZ5je54j370sK/BcrvPH3PKlELsXGc/MRf9nupm0VXsemPP0LufdgpznSGbBJJGlYC8Q8lwN/lJNxQXXfkKe/l/qS2Ocsyo8vXsKcwUfuRMhT/8kbqzgc28nOD2LSO9pq8N/EbkRIc/ArGNrgPqHpzsW9Gw7jAEaGJ6nWxMhz9xBDNDA7Plh6yzkGaoTd1RY8VyKDgspz1UHUPGhav9w9CjluR28lF9McH4WvIfThbSU53zwWtxjA5yfh2/hUNRzLnwx7mCsvRX9FrmDY1HProvlrmrR30ax698Q9cxcPE82V5TmSYWrX5D1XHXgKWQ958E5P7yZIeY5B+55LOzZBvfcEPbMwD0XpD2XsD0zaU/sCfRA3LN9FqZPQc9sdAamT0lP5An0P09pBT3nzsD0KenZPQPTp6Qn8ha+SOE5h1/uop5d/HIX9cQt+CKN5zn4cpf1RC345USeoEv6/37lUtZzFtLzZTJPzD38OJ0nYkf6n7eFhD0RO9JyQs/Ie0zWu5G8J94A3UjqCTdAP/o+RdyzCz085T3BBujHn0/Je2IN0OXknpG3pm3l//6eTALPHGiTtKDAE2gXf5xp8IQ5ZvqbD32SeHZHmM0olSdIxR9nWjwhFqF/+7fiEnki9PgFRZ4AU+hypsnT/OuLjzJdnsZ7ku+L03Sese8hVcf7vWlCT8Og/s93U3qanUMDn5cn9czaJrv8T5lWzyxftLeMH2d6PbPs6Qim1lV4ZvkdQ6Kb40y7pyHRx+PovWjwfJutO0+UWx6t/FhUuBElnu9G6ZdbT28rzdavRcW70OOJEXrSk570pCc96UlPhp70pCdDT3rSk570pCc96Wkge74U9PyUyPz/TXrSk570pCc96UlPetKTnvSkJz3pSU960pOe9KQnPelJT3rSk570pCc96UlPetKTnvSkJz3pSU960pOe9KQnPelJT3r60vfdTCF2Ced9l/CKnrV6vjboWSr2PLHHmXs95a5hxncJb+x5tjR7Tu15dhR4dhTMOY3PXRMNnjvmPIcKaq1X4ixA+wo8/XO4uYak4lb8awxzE6i3tYqu/fyea8Y890sNe5N+CbKi95e76N553X8ZA1OeV0sVrdVfJbYGaO4vNNGl39B/GRNLA/RiqaPQzpcQAzQ0PEVXKp3AdRjaIwWmLcntZmiD9O5KrKxBL4fuQnRnkpdqLqWRtZL4tNUPXssNCyO0F76HV2pmnncjVD/olfAdCG/0hpGrmTxXXuu7kRsQ3pfMxC6nnOzduqA0l75/Eb984cmnBI90T0X3lH7yvQ7uKX3uOAT3lD6FmMHmnIgvONiOJHdI1nNN3BN7ApU/I5vh9MkJtGpSnIn3OX1KPRrk6pNb+PSvXeIW/FdJPIcsdxa83nIPP73mWR0LPm25wxZ8usfdmIfKa8k8IffwCV9vgexIKb+ZROxIg4SegIdMaV++whugO0k9Wxyeoi+GcXie7TV9+ldX9zk8OYP6ouFbiotce3KTpOlc/uN0YM6RCxWeMC1pRwcnSsVfz7QEYhGq6W/z3AQ49hwo8sztT6H3Mk3J18lZ7zapz15Ub0+yDKrxC17DoDq/3zVb8tcznWnZbEo/Z1qT79rTnDzLFOdKn1NnvUP0hanBqfwz/fezqBnRqQHN96J79w0MzYdGNE/L/vu9Fw++VppvHjzc+zZjGIZhGIZpLH8C2FKZQTTgNvkAAAAASUVORK5CYII='
  t.is(await contentLength.fromDataUri(dataUri), 2909)
})

test('.fromResponse headers', async t => {
  {
    const url =
      'https://mirrors.dotsrc.org/blender/blender-demo/movies/ToS/tearsofsteel_4k.mov?fromResponse'

    const res = await got(url, {
      headers: {
        Range: 'bytes=0-0'
      }
    })

    t.true(reachableUrl.isReachable(res))
    t.is(await contentLength.fromResponse(res), 6737592810)
  }
  {
    const url =
      'https://mirrors.dotsrc.org/blender/blender-demo/movies/ToS/tearsofsteel_4k.mov?fromResponse'
    const res = await reachableUrl(url)

    t.true(reachableUrl.isReachable(res))
    t.is(await contentLength.fromResponse(res), 6737592810)
  }
  {
    const url = 'https://microlink.io/logo.svg'
    const res = await reachableUrl(url, { headers: { Range: undefined } })

    t.true(reachableUrl.isReachable(res))
    t.is(await contentLength.fromResponse(res), 780)
  }
})

test('.fromResponse headers (Web API)', async t => {
  const url = 'https://cdn.microlink.io/logo/logo.png'
  const res = await fetch(url)
  t.is(await contentLength.fromResponse(res), 2784)
})

test('.fromResponse body', async t => {
  const url = 'https://microlink.io/logo.svg'
  const res = await reachableUrl(url, { headers: { Range: undefined } })
  delete res.headers['content-length']
  t.is(await contentLength.fromResponse(res), 780)
})

test('.fromResponse body (Web API)', async t => {
  const url = 'https://microlink.io/logo.svg'
  const res = await fetch(url)
  const headers = new Headers(res.headers)
  headers.delete('content-length')
  const modifiedRes = new Response(res.body, { headers })
  t.is(await contentLength.fromResponse(modifiedRes), 780)
})
