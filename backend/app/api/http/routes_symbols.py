from typing import List

from fastapi import APIRouter, Query

from app.schemas.symbols import SymbolSearchResult
from app.services.http.symbols_service import SymbolsService

router = APIRouter(tags=["Symbols"])


@router.get(
    "/symbols/search",
    response_model=List[SymbolSearchResult],
)
async def search_symbols(
    q: str = Query(
        "",
        min_length=0,
        max_length=32,
        description="Symbol search term, e.g. 'aap' or 'ts'",
    ),
    limit: int = Query(
        10,
        ge=1,
        le=50,
        description="Maximum number of symbols to return",
    ),
) -> List[SymbolSearchResult]:
    """
    Search across all available symbols defined in shared/symbols.py.

    Response is a plain array:
      [
        { "symbol": "AAPL", "name": "Apple Inc." },
        ...
      ]
    """
    configs = await SymbolsService.search_symbols(q, limit)

    return [
        SymbolSearchResult(symbol=cfg.symbol, name=cfg.name)
        for cfg in configs
    ]