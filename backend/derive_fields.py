def derive_fields(scraped):
    derived = {}

    text = (
        scraped.get("about", "") +
        scraped.get("funding", "") +
        scraped.get("who_can_apply", "")
    ).lower()

    # Issue Areas
    issue_areas = []
    if "elder" in text:
        issue_areas.append("Eldercare")
    if "youth" in text:
        issue_areas.append("Youth")

    derived["issueAreas"] = issue_areas

    # Funding %
    if "90%" in scraped.get("funding", ""):
        derived["fundingPercent"] = 90
    else:
        derived["fundingPercent"] = None

    # Deadline
    if "throughout the year" in scraped.get("when_to_apply", "").lower():
        derived["deadlineType"] = "Rolling"
        derived["deadline"] = None
    else:
        derived["deadlineType"] = "Fixed"

    return derived
