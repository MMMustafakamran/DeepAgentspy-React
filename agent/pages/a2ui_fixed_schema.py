# Verbatim: https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/fixed-schema ("Define the agent tool")
# HARNESS: a2ui/schemas/flight_schema.json is not shown on the page ("design it in A2UI Composer");
# the file next to this one is the old harness's hand-written schema (guesswork).
from copilotkit import a2ui
from langchain.tools import tool
from pathlib import Path
from typing import TypedDict


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


SURFACE_ID = "flight-search-results"

FLIGHT_SCHEMA = a2ui.load_schema(
    Path(__file__).parent / "a2ui" / "schemas" / "flight_schema.json"
)


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
