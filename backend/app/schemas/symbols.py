from pydantic import BaseModel


class SymbolSearchResult(BaseModel):
    symbol: str
    name: str