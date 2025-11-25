import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import { Badge } from './ui/badge';
import {
  Search,
  FileText,
  Calendar,
  Users,
  Lightbulb,
  Building,
  Newspaper,
  Mail,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock search data
const searchData = {
  pages: [
    { id: 1, title: 'About Our Mission', description: 'Learn about our company values and goals', url: '#about', icon: Building },
    { id: 2, title: 'Contact Us', description: 'Get in touch with our team', url: '#contact', icon: Mail },
    { id: 3, title: 'FAQ', description: 'Frequently asked questions', url: '#faq', icon: FileText },
    { id: 4, title: 'Events', description: 'Upcoming events and workshops', url: '#events', icon: Calendar },
  ],
  articles: [
    { id: 1, title: 'Modern Architecture Innovation', type: 'Innovation', date: 'Nov 1, 2025' },
    { id: 2, title: 'Strategic Business Meeting', type: 'Business', date: 'Oct 28, 2025' },
    { id: 3, title: 'Technology Workspace Excellence', type: 'Technology', date: 'Oct 25, 2025' },
  ],
  events: [
    { id: 1, title: 'Technical Workshop: AI & Machine Learning', date: 'November 10, 2025' },
    { id: 2, title: 'Cloud Infrastructure Seminar', date: 'November 12-13, 2025' },
    { id: 3, title: 'Product Demo: New Platform Features', date: 'November 15, 2025' },
  ],
  team: [
    { id: 1, name: 'Sarah Johnson', role: 'Chief Executive Officer' },
    { id: 2, name: 'Michael Chen', role: 'Chief Technology Officer' },
    { id: 3, name: 'Emily Rodriguez', role: 'VP of Operations' },
    { id: 4, name: 'David Kim', role: 'Head of Sales' },
  ],
};

const popularSearches = [
  'Product Demo',
  'Pricing',
  'Documentation',
  'Support',
  'Contact Sales',
  'Leadership Team',
];

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Annual Corporate Summit',
    'Contact Information',
    'FAQ',
  ]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleSelect = (value: string) => {
    // Add to recent searches
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== value);
      return [value, ...filtered].slice(0, 5);
    });
    onOpenChange(false);
  };

  const filteredPages = searchData.pages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArticles = searchData.articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = searchData.events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeam = searchData.team.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasResults = filteredPages.length > 0 || filteredArticles.length > 0 ||
                     filteredEvents.length > 0 || filteredTeam.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search for pages, articles, events, and team members
        </DialogDescription>

        <Command className="rounded-lg border-0" shouldFilter={false}>
          <div className="flex items-center border-b px-4">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <CommandInput
              placeholder="Search for pages, articles, events, team members..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="border-0 focus:ring-0"
            />
            <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] ml-2">
              ESC
            </kbd>
          </div>

          <CommandList className="max-h-[400px] overflow-y-auto">
            {!searchQuery && (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <>
                    <CommandGroup heading="Recent Searches">
                      {recentSearches.map((search, index) => (
                        <CommandItem
                          key={index}
                          onSelect={() => setSearchQuery(search)}
                          className="cursor-pointer"
                        >
                          <Clock className="mr-2 h-4 w-4 text-gray-400" />
                          <span>{search}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}

                {/* Popular Searches */}
                <CommandGroup heading="Popular Searches">
                  {popularSearches.map((search, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => setSearchQuery(search)}
                      className="cursor-pointer"
                    >
                      <TrendingUp className="mr-2 h-4 w-4 text-indigo-500" />
                      <span>{search}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {searchQuery && !hasResults && (
              <CommandEmpty>
                <div className="py-6 text-center">
                  <Search className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-600">No results found for "{searchQuery}"</p>
                  <p className="text-xs text-gray-500 mt-1">Try searching with different keywords</p>
                </div>
              </CommandEmpty>
            )}

            {searchQuery && hasResults && (
              <>
                {/* Pages */}
                {filteredPages.length > 0 && (
                  <>
                    <CommandGroup heading="Pages">
                      {filteredPages.map((page) => {
                        const Icon = page.icon;
                        return (
                          <CommandItem
                            key={page.id}
                            onSelect={() => handleSelect(page.title)}
                            className="cursor-pointer group"
                          >
                            <div className="flex items-center flex-1">
                              <div className="mr-3 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <Icon className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="group-hover:text-indigo-600 transition-colors">
                                    {page.title}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{page.description}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}

                {/* Articles */}
                {filteredArticles.length > 0 && (
                  <>
                    <CommandGroup heading="Articles">
                      {filteredArticles.map((article) => (
                        <CommandItem
                          key={article.id}
                          onSelect={() => handleSelect(article.title)}
                          className="cursor-pointer group"
                        >
                          <div className="flex items-center flex-1">
                            <div className="mr-3 w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                              <Newspaper className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="group-hover:text-indigo-600 transition-colors">
                                  {article.title}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {article.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{article.date}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}

                {/* Events */}
                {filteredEvents.length > 0 && (
                  <>
                    <CommandGroup heading="Events">
                      {filteredEvents.map((event) => (
                        <CommandItem
                          key={event.id}
                          onSelect={() => handleSelect(event.title)}
                          className="cursor-pointer group"
                        >
                          <div className="flex items-center flex-1">
                            <div className="mr-3 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <span className="group-hover:text-indigo-600 transition-colors">
                                {event.title}
                              </span>
                              <p className="text-xs text-gray-500 mt-0.5">{event.date}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}

                {/* Team Members */}
                {filteredTeam.length > 0 && (
                  <CommandGroup heading="Team Members">
                    {filteredTeam.map((member) => (
                      <CommandItem
                        key={member.id}
                        onSelect={() => handleSelect(member.name)}
                        className="cursor-pointer group"
                      >
                        <div className="flex items-center flex-1">
                          <div className="mr-3 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <span className="group-hover:text-indigo-600 transition-colors">
                              {member.name}
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5">{member.role}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>

          {/* Footer */}
          <div className="border-t p-3 bg-gray-50/50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white border">↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border">↵</kbd>
                  <span>Select</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span>Search powered by</span>
                <Lightbulb className="h-3 w-3 text-indigo-600" />
                <span className="text-indigo-600">TechCorp</span>
              </div>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
