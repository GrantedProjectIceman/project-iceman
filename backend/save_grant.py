from derive_fields import derive_fields
from save_grant import save_grant

scraped = {
    "source": "oursggrants",
    "source_url": "oursggrants.gov.sg",
    "title": "Community Care Manpower Development Award",
    "about": "Supports elder care organisations...",
    "funding": "Funds up to 90% of course fees",
    "when_to_apply": "Applications are accepted throughout the year."
}

final_grant = {
    **scraped,
    **derive_fields(scraped)
}

save_grant(final_grant)
