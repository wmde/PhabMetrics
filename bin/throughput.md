## throughput.js

Calculate throughput of closed tasks.

prints out CSV file with following columns:
- day|week|month (depending on aggregation period selected)
- tasksClosed

### Arguments

**Conduit API base**

Conduit API base is the base url of the targeted Phabricator instance.
This configuration must include the full url leading to api base, which typically
includes `/api/` at the end of it.

The script will check first for `api_base` argument, and then for an
env variable `CONDUIT_API_BASE`.

**Conduit API token**

Conduit API token is needed to access Phabricator. You can create one for your
Phabricator account under Settings -> Conduit API Token

The script will check first for `api_token` argument, and then for an
env variable `CONDUIT_API_TOKEN`.

**Aggregation Options**
With none of the following arguments, this script will aggregate throughput
per each day within the given period (see Dates range).

This can be changed by specifying one of the following arguments
(if you specify more than one, the first one will be taken according to
the order they were given below):

* `--daily` (default when nothing specified): calculate throughput per day
* `--weekly`: calculate throughput per week
* `--monthly`: calculate throughput per month

# Examples

```
export CONDUIT_API_BASE='https://yourdomain/phabricator/api'
export CONDUIT_API_TOKEN='******'

node throughput.js --week 1 --daily
node throughput.js --month 2 --weekly
node throughput.js --fromDate 2019-01-01 --toDate 2019-06-30 --monthly
```

**Dates range**

With none of the following arguments, the script will calculate throughput for tasks
that were closed in the current week.

This can be changed by specifying one of the following arguments
(if you specify more than one, the first one will be taken according to
the order they were given below):

* `--fromDate`, `--toDate` (optional): the dates of which to look for tasks
  closed in that period.

  if `toDate` is not given, it will default to the end of the day of
  `fromDate`.

  note: `fromDate` and `toDate` will be adjusted to the beginning and the end
  of that day, respectively.

  date can be given in any format that is accepted by momentjs, examples:
  - 2013-02-08
  - "06 Mar 2017"
  - "Mon, 06 Mar 2017"

  For more info
  check (parsing strings)[https://momentjs.com/docs/#/parsing/string/]

* `-m` or `--month`: the month to calculate throughput within in the current year
  Starts from 0; 0 for January and 11 for December.

* `-w` or `--week`: the week to calculate throughput within in the current year.
  Starts from 1.

``` shell
# Examples

export CONDUIT_API_BASE='https://yourdomain/phabricator/api'
export CONDUIT_API_TOKEN='******'

node throughput.js --fromDate 2019-01-01
node throughput.js --fromDate 2019-01-01 --toDate 2019-02-28
node throughput.js --month 2
node throughput.js --week 10
```

**Projets**

`--projects` argument can be used to select only tasks in specific projects.

``` shell
# Examples

export CONDUIT_API_BASE='https://yourdomain/phabricator/api'
export CONDUIT_API_TOKEN='******'

node throughput.js --projects Wikidata
node throughput.js --projects Wikidata --projects Wikidata-Campsite
```

**Sub-Types**

`--subtypes` argument can be used to select only tasks of specific sub-types.


``` shell
# Examples

export CONDUIT_API_BASE='https://yourdomain/phabricator/api'
export CONDUIT_API_TOKEN='******'

node throughput.js --subtypes bug
```
