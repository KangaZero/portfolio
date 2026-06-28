import { Column, DropdownWrapper, Icon, IconButton, Input, Option } from "@once-ui-system/core";
import type { ReactNode } from "react";
import type { Achievement } from "@/types";

export default function SearchBar({
  currentSearchTerm,
  setCurrentSearchTerm,
  searchResultDescription,
  isFilterDropdownOpen,
  setIsFilterDropdownOpen,
  currentSelectedFilters,
  setCurrentSelectedFilters,
  achievementsCount,
}: {
  currentSearchTerm: string;
  setCurrentSearchTerm: (term: string) => void;
  searchResultDescription: string;
  isFilterDropdownOpen: boolean;
  setIsFilterDropdownOpen: (isOpen: boolean) => void;
  achievementsCount: Record<Achievement["rarity"], number>;
  currentSelectedFilters: Achievement["rarity"][];
  setCurrentSelectedFilters: (filters: Achievement["rarity"][]) => void;
}) {
  const achievementsCountAsArray: {
    label: string;
    value: Achievement["rarity"];
  }[] = Object.entries(achievementsCount).map(([key, value]) => ({
    label: `${key.charAt(0).toUpperCase() + key.slice(1)} (${value})`,
    value: key as Achievement["rarity"],
  }));
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSearchTerm(e.target.value);
  };

  const validateSearchInput = (input: ReactNode) => {
    if (!input || typeof input !== "string") return null;
    const regex = /^[a-zA-Z0-9\s-]*$/;
    if (!regex.test(input)) {
      return "Only alphanumeric characters, spaces, and hyphens are allowed.";
    } else {
      return null;
    }
  };

  const handleClearSearchTerm = () => {
    setCurrentSearchTerm("");
    setCurrentSelectedFilters([]);
  };

  const handleSelectFilterOption = (value: Achievement["rarity"]) => {
    if (!value) return;
    if (currentSelectedFilters.includes(value)) {
      setCurrentSelectedFilters(currentSelectedFilters.filter((filter) => filter !== value));
    } else {
      setCurrentSelectedFilters([...currentSelectedFilters, value]);
    }
  };

  return (
    <Input
      id="achievement-search"
      label="Search Achievements"
      validate={validateSearchInput}
      description={currentSearchTerm.trim() !== "" ? searchResultDescription : ""}
      value={currentSearchTerm}
      onChange={handleSearchInputChange}
      hasPrefix={<Icon name="search" size="xs" />}
      hasSuffix={
        <>
          <DropdownWrapper
            isOpen={isFilterDropdownOpen}
            onOpenChange={setIsFilterDropdownOpen}
            trigger={
              <IconButton
                tooltip="Filter by rarity"
                variant={currentSelectedFilters.length ? "danger" : "ghost"}
                icon="filter"
                size="s"
                aria-label="Filter by rarity"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              />
            }
            dropdown={
              <Column minWidth={10} padding="4" gap="2">
                {achievementsCountAsArray.map((option) => (
                  <Option
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    selected={currentSelectedFilters.includes(option.value)}
                    onPointerDown={() => handleSelectFilterOption(option.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handleSelectFilterOption(option.value);
                    }}
                  />
                ))}
              </Column>
            }
          />
          {currentSearchTerm.length > 0 || currentSelectedFilters.length > 0 ? (
            <IconButton
              tooltip="Clear search & filter"
              variant="ghost"
              icon="close"
              size="s"
              onClick={handleClearSearchTerm}
              aria-label="Clear search & filter"
              style={{
                marginLeft: 8,
                marginRight: 8,
              }}
            />
          ) : null}
        </>
      }
    />
  );
}
