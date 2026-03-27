// All 30 MLB teams — MLB Stats API IDs, ESPN abbreviation mappings, hex colors, divisions
// Colors sourced from official team brand guides

const MLB_TEAMS = [
  // AL East
  { id: 110, name: 'Baltimore Orioles', abbr: 'BAL', espn: 'bal', division: 'AL East', colors: { primary: '#DF4601', secondary: '#27251F', accent: '#FFFFFF' } },
  { id: 111, name: 'Boston Red Sox', abbr: 'BOS', espn: 'bos', division: 'AL East', colors: { primary: '#BD3039', secondary: '#0C2340', accent: '#FFFFFF' } },
  { id: 147, name: 'New York Yankees', abbr: 'NYY', espn: 'nyy', division: 'AL East', colors: { primary: '#003087', secondary: '#E4002B', accent: '#FFFFFF' } },
  { id: 139, name: 'Tampa Bay Rays', abbr: 'TB', espn: 'tb', division: 'AL East', colors: { primary: '#092C5C', secondary: '#8FBCE6', accent: '#F5D130' } },
  { id: 141, name: 'Toronto Blue Jays', abbr: 'TOR', espn: 'tor', division: 'AL East', colors: { primary: '#134A8E', secondary: '#1D2D5C', accent: '#E8291C' } },

  // AL Central
  { id: 145, name: 'Chicago White Sox', abbr: 'CWS', espn: 'chw', division: 'AL Central', colors: { primary: '#27251F', secondary: '#C4CED4', accent: '#FFFFFF' } },
  { id: 114, name: 'Cleveland Guardians', abbr: 'CLE', espn: 'cle', division: 'AL Central', colors: { primary: '#00385D', secondary: '#E50022', accent: '#FFFFFF' } },
  { id: 116, name: 'Detroit Tigers', abbr: 'DET', espn: 'det', division: 'AL Central', colors: { primary: '#0C2340', secondary: '#FA4616', accent: '#FFFFFF' } },
  { id: 118, name: 'Kansas City Royals', abbr: 'KC', espn: 'kc', division: 'AL Central', colors: { primary: '#004687', secondary: '#BD9B60', accent: '#FFFFFF' } },
  { id: 142, name: 'Minnesota Twins', abbr: 'MIN', espn: 'min', division: 'AL Central', colors: { primary: '#002B5C', secondary: '#D31145', accent: '#FFFFFF' } },

  // AL West
  { id: 117, name: 'Houston Astros', abbr: 'HOU', espn: 'hou', division: 'AL West', colors: { primary: '#002D62', secondary: '#EB6E1F', accent: '#FFFFFF' } },
  { id: 108, name: 'Los Angeles Angels', abbr: 'LAA', espn: 'laa', division: 'AL West', colors: { primary: '#BA0021', secondary: '#003263', accent: '#FFFFFF' } },
  { id: 133, name: 'Oakland Athletics', abbr: 'OAK', espn: 'oak', division: 'AL West', colors: { primary: '#003831', secondary: '#EFB21E', accent: '#FFFFFF' } },
  { id: 136, name: 'Seattle Mariners', abbr: 'SEA', espn: 'sea', division: 'AL West', colors: { primary: '#0C2C56', secondary: '#005C5C', accent: '#C4CED4' } },
  { id: 140, name: 'Texas Rangers', abbr: 'TEX', espn: 'tex', division: 'AL West', colors: { primary: '#003278', secondary: '#C0111F', accent: '#FFFFFF' } },

  // NL East
  { id: 144, name: 'Atlanta Braves', abbr: 'ATL', espn: 'atl', division: 'NL East', colors: { primary: '#CE1141', secondary: '#13274F', accent: '#EAAA00' } },
  { id: 146, name: 'Miami Marlins', abbr: 'MIA', espn: 'mia', division: 'NL East', colors: { primary: '#00A3E0', secondary: '#EF3340', accent: '#41748D' } },
  { id: 121, name: 'New York Mets', abbr: 'NYM', espn: 'nym', division: 'NL East', colors: { primary: '#002D72', secondary: '#FF5910', accent: '#FFFFFF' } },
  { id: 143, name: 'Philadelphia Phillies', abbr: 'PHI', espn: 'phi', division: 'NL East', colors: { primary: '#E81828', secondary: '#002D72', accent: '#FFFFFF' } },
  { id: 120, name: 'Washington Nationals', abbr: 'WSH', espn: 'wsh', division: 'NL East', colors: { primary: '#AB0003', secondary: '#14225A', accent: '#FFFFFF' } },

  // NL Central
  { id: 112, name: 'Chicago Cubs', abbr: 'CHC', espn: 'chc', division: 'NL Central', colors: { primary: '#0E3386', secondary: '#CC3433', accent: '#FFFFFF' } },
  { id: 113, name: 'Cincinnati Reds', abbr: 'CIN', espn: 'cin', division: 'NL Central', colors: { primary: '#C6011F', secondary: '#000000', accent: '#FFFFFF' } },
  { id: 158, name: 'Milwaukee Brewers', abbr: 'MIL', espn: 'mil', division: 'NL Central', colors: { primary: '#FFC52F', secondary: '#12284B', accent: '#FFFFFF' } },
  { id: 134, name: 'Pittsburgh Pirates', abbr: 'PIT', espn: 'pit', division: 'NL Central', colors: { primary: '#27251F', secondary: '#FDB827', accent: '#FFFFFF' } },
  { id: 138, name: 'St. Louis Cardinals', abbr: 'STL', espn: 'stl', division: 'NL Central', colors: { primary: '#C41E3A', secondary: '#0C2340', accent: '#FEDB00' } },

  // NL West
  { id: 109, name: 'Arizona Diamondbacks', abbr: 'ARI', espn: 'ari', division: 'NL West', colors: { primary: '#A71930', secondary: '#E3D4AD', accent: '#000000' } },
  { id: 115, name: 'Colorado Rockies', abbr: 'COL', espn: 'col', division: 'NL West', colors: { primary: '#333366', secondary: '#C4CED4', accent: '#000000' } },
  { id: 119, name: 'Los Angeles Dodgers', abbr: 'LAD', espn: 'lad', division: 'NL West', colors: { primary: '#005A9C', secondary: '#EF3E42', accent: '#FFFFFF' } },
  { id: 135, name: 'San Diego Padres', abbr: 'SD', espn: 'sd', division: 'NL West', colors: { primary: '#2F241D', secondary: '#FFC425', accent: '#FFFFFF' } },
  { id: 137, name: 'San Francisco Giants', abbr: 'SF', espn: 'sf', division: 'NL West', colors: { primary: '#FD5A1E', secondary: '#27251F', accent: '#EFD19F' } },
]

// Quick lookups
export const getTeamById = (id) => MLB_TEAMS.find(t => t.id === id)
export const getTeamByAbbr = (abbr) => MLB_TEAMS.find(t => t.abbr.toLowerCase() === abbr.toLowerCase())
export const getTeamsByDivision = (division) => MLB_TEAMS.filter(t => t.division === division)
export const getAllDivisions = () => [...new Set(MLB_TEAMS.map(t => t.division))]

// ESPN CDN logo URL
export const teamLogo = (abbreviation) => {
  const team = getTeamByAbbr(abbreviation)
  const espnAbbr = team ? team.espn : (abbreviation || '').toLowerCase()
  return `https://a.espncdn.com/i/teamlogos/mlb/500/${espnAbbr}.png`
}

// Division lookup from team
export const getDivisionForTeam = (teamId) => {
  const team = getTeamById(teamId)
  return team ? team.division : null
}

export default MLB_TEAMS
