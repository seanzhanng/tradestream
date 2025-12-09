from typing import List
from symbols import SYMBOL_CONFIGS, SymbolConfig

class SymbolsService:
    @staticmethod
    async def search_symbols(query: str, limit: int = 10) -> List[SymbolConfig]:
        """
        Search available symbols from shared.symbols.SYMBOL_CONFIGS.

        - If query is empty → first `limit` symbols.
        - Otherwise → symbols that START with query first, then those that
          just CONTAIN it.
        """
        cleaned = query.strip().upper()

        if cleaned == "":
            return SYMBOL_CONFIGS[:limit]

        starts_with: List[SymbolConfig] = [
            cfg for cfg in SYMBOL_CONFIGS
            if cfg.symbol.startswith(cleaned)
        ]

        contains: List[SymbolConfig] = [
            cfg for cfg in SYMBOL_CONFIGS
            if cleaned in cfg.symbol and cfg not in starts_with
        ]

        return (starts_with + contains)[:limit]