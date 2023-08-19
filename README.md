# Tapestry reporting v1.1

First revision: 30/06/2022

## Revisions

## Tapestry Report Merger turned into Tapestry Report Generator

v1.1: Migrated to Google Identity Services.

v1.0.0: Now exports an Excel (.xlsx) file instead of a comma-delimited .csv file. Added various error messages and warnings. It now warns the user if the results have not yet been finalized ("golden"). Limited Revenue number to 2 decimals.

v0.9.4: Checking if the report is "golden" (means fully processed and will not provide different results if the same report is requested in the future) and showing an alert if it's not.

v0.9.3: Some minor bugs and fixes. Removed "download" button. Report is automatically generated and downloaded once previous steps are complete. Lots of UI/UX updates. File name now is the campaign name. Variants with the same persado_email_version are now always combined.

v0.9.2: Works with everything, except Sampled reports, where an Unsampled request is necessary.

v0.9: Working on Non-Pred Emails.

v0.8: Total rehaul. Integrated with Google Analytics API, instead of uploading the GA report manually.

v0.7.1: Now downloads .xlsx files instead of .csv.

v0.7: Added download counter. Now you can see how many times the final reports were generated and downloaded! 

v0.6: Strips spaces in GA SMS campaign names, because we had cases where the names with the Attentive report didn't match because of that, and also "scans" the final message names for "variant" and "cntrl" which get replaced with "VRNT" and "CTRL", something required for this kind of reports. There may be other cases here, I need more samples.

v0.5: Now also works when the campaign name in GA file has multiple entries in the SFMC file and it adds up the numbers. The page gets refreshed every time a final report is downloaded, to ensure no conflicts on multiple opens. Radio selection persists through page refreshes via sessionStorage.

v0.4: Added support for SMS reports. Now the user can select "email" or "sms" as a first step before uploading any files and they get processed accordingly.

v0.3: Added support for GA files with multiple rows, where we want the sum of the data. Now also works in cases where the data we need is in "Dataset4" instead of "Dataset1" (this happens when generating an unsampled report on GA).

v0.2: It's now looking for the column names row by a string, instead of a fixed row number, so that's dynamic, the row can be anywhere and it'll still find the correct one.

v0.1: The 2 report files are opened and read, showing a list of them on screen. It retrieves the necessary data, creates a new report with all the needed data and formatted as required, and downloads it locally as export.csv.

** Only tested in Chrome. **

## Tapestry Report Merger branch

v1.0.1: Updated for new Sigma reporting process: now it checks if "Sheet1", "Dataset4", "Dataset1" exist, in that order, and then it reads the first one that exists.
