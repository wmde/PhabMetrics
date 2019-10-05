## leadtime.js

Calculate lead times for tasks.

prints out CSV file with following columns:
- id: Task id (with T prefix)
- createdOn: date of task creation
- closedOn: date of task closing (as resolved or declined)
- leadtimeDays: leadtime in days (working days, taking 5 days a week)
- status: the task status name (resolved or declined)
- subtype: the task subtype

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

**Dates range**

With no arguments, the script will calculate leadtimes for tasks
that were created and closed during the current week.

This can be changed by specifying one of the following arguments
(if you specify more than one, the first one will be taken according to
the order they were given below):

* `--fromDate`, `--toDate` (optional): the dates of which to look for tasks
  created on and after, and were closed on and before.

  if `toDate` is not given, it will default to the end of the day of
  `fromDate`.

  note: `fromDate` and `toDate` will be adjusted to the beginning and end
  of that day, respectively.

  date can be given in any format that is accepted by momentjs, examples:
  - 2013-02-08
  - "06 Mar 2017"
  - "Mon, 06 Mar 2017"

  For more info
  check (parsing strings)[https://momentjs.com/docs/#/parsing/string/]

* `-m` or `--month`: the month to calculate leadtimes for in the current year
  Starts from 0; 0 for January and 11 for December.

* `-w` or `--week`: the week to calculate leadtimes for in the current year.
  Starts from 1.

``` shell
# Examples

export CONDUIT_API_TOKEN='******'

node leadtime.js --fromDate 2019-01-01
node leadtime.js --fromDate 2019-01-01 --toDate 2019-02-28
node leadtime.js --month 2
node leadtime.js --week 10
```

**Projets**

`--projects` argument can be used to select only tasks in specific projects.

``` shell
# Examples

export CONDUIT_API_TOKEN='******'

node leadtime.js --projects Wikidata
node leadtime.js --projects Wikidata --projects Wikidata-Campsite
```

**Sub-Types**

`--subtypes` argument can be used to select only tasks of specific sub-types.


``` shell
# Examples

export CONDUIT_API_TOKEN='******'

node leadtime.js --subtypes bug
```
