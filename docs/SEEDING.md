# CivicSignal Illustrative Sample Data

## Purpose

CivicSignal currently uses five **fictional illustrative sample scenarios** for demonstrations, portfolio screenshots and controlled usability tests.

They are not real authority records, live community reports, or verified incidents.

Each seeded board card displays:

```text
Illustrative sample
```

## Included scenarios

1. Blocked storm drain near a pedestrian crossing — with generated illustrative image
2. Streetlight outage along an evening pedestrian route — with generated illustrative image
3. Overfilled community refuse collection point — with generated illustrative image
4. Faded road marking near a school-zone crossing
5. Intermittent access at a community water point

## Important: destructive reset

The seed script deletes the current records in the CivicSignal development DynamoDB table before adding the sample records.

Use it only before real public submissions begin. Do not run it after accepting real community reports.

## Run from an AWS-configured local machine

```bash
cd scripts
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

python seed_sample_incidents.py \
  --table civicsignal-dev-incidents \
  --bucket civicsignal-evidence-360831508664-2026 \
  --confirm RESET_CIVICSIGNAL_DEVELOPMENT_DATA
```

The script:

```text
1. Deletes current development records
2. Uploads three generated illustrative photos to the private evidence bucket
3. Adds five sample incident records
4. Marks three sample photos as Approved
5. Labels every seeded record as an illustrative sample scenario
```

## After seeding

Open the public board and hard refresh:

```text
https://civicsignalgh.vercel.app
```

The board should show five illustrative scenarios, three with approved images visible only on their individual issue detail pages.
