"""Agent backing the Fixed Schema A2UI route.

https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/fixed-schema

This is the one page in this repo whose Python does not run as printed. The
page calls four helpers on `copilotkit.a2ui` that the shipped package does not
have; the table below is the mapping this file uses instead, and the route page
in the app shows it side by side with the doc's snippet.

    page                                     copilotkit 0.1.94
    ─────────────────────────────────────    ────────────────────────────────
    a2ui.surface_update(id, schema)          a2ui.update_components(id, schema)
    a2ui.data_model_update(id, data)         a2ui.update_data_model(id, data)
    a2ui.begin_rendering(id, "root")         a2ui.create_surface(id, catalog_id)
    a2ui.render(operations=…,                a2ui.render(operations=…)
                action_handlers=…)           — no action_handlers parameter

`create_surface` is not a rename of `begin_rendering`: it carries the catalog
id and must come first, because the catalog is what the frontend renderer
resolves component names against. `render` keeps its `operations=` keyword, so
that half of the call is unchanged.

The consequence of the missing `action_handlers` is that the Book button in
`flight_schema.json` is inert — nothing swaps the surface to `booked_schema`.
Both schemas are loaded anyway so the swap can be wired the moment the SDK
grows the parameter.

The two schema JSON files were supplied for this repo, not derived from the
page: it says to design them in the A2UI Composer and never prints one.
"""

#region schema-load
import json
from pathlib import Path
from typing import TypedDict

from copilotkit import a2ui

CATALOG_ID = "copilotkit://flight-fixed-catalog"
SURFACE_ID = "flight-search-results"

_SCHEMAS_DIR = Path(__file__).parent / "a2ui_schemas"

FLIGHT_SCHEMA = a2ui.load_schema(_SCHEMAS_DIR / "flight_schema.json")
# Loaded but currently unreachable — see the module docstring.
BOOKED_SCHEMA = a2ui.load_schema(_SCHEMAS_DIR / "booked_schema.json")
#endregion





#region search-flights
from langchain.tools import tool

class Flight(TypedDict):
    id: str
    airline: str
    airlineLogo: str
    flightNumber: str
    origin: str
    destination: str
    date: str
    departureTime: str
    arrivalTime: str
    duration: str
    status: str
    statusIcon: str
    price: str



@tool
def search_flights(flights: list[Flight]) -> str:
    """Search for flights and display results as rich cards."""
    return a2ui.render(
        operations=[
            a2ui.create_surface(SURFACE_ID),
            a2ui.update_components(SURFACE_ID, FLIGHT_SCHEMA),
            a2ui.update_data_model(SURFACE_ID, {"flights": flights}),
        ],
    )


#endregion


#region register
from deepagents import create_deep_agent

from src.shared import MODEL

agent = create_deep_agent(
    model=MODEL,
    tools=[search_flights],
    system_prompt=(
        "You help users find flights. When asked about a flight, call "
        "search_flights exactly once with origin, destination, airline and "
        "price. Its return value is an A2UI surface descriptor — the card is "
        "already on screen, so do not call it again for the same trip. Then "
        "reply with one short confirmation sentence and stop."
    ),
)
#endregion
