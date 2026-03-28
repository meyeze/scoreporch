// Minimal team data for the widget (same source as main app)
const TEAMS = [
  { id: 110, name: 'Baltimore Orioles', abbr: 'BAL', espn: 'bal', division: 'AL East', primary: '#DF4601', secondary: '#27251F' },
  { id: 111, name: 'Boston Red Sox', abbr: 'BOS', espn: 'bos', division: 'AL East', primary: '#BD3039', secondary: '#0C2340' },
  { id: 147, name: 'New York Yankees', abbr: 'NYY', espn: 'nyy', division: 'AL East', primary: '#003087', secondary: '#E4002B' },
  { id: 139, name: 'Tampa Bay Rays', abbr: 'TB', espn: 'tb', division: 'AL East', primary: '#092C5C', secondary: '#8FBCE6' },
  { id: 141, name: 'Toronto Blue Jays', abbr: 'TOR', espn: 'tor', division: 'AL East', primary: '#134A8E', secondary: '#1D2D5C' },
  { id: 145, name: 'Chicago White Sox', abbr: 'CWS', espn: 'chw', division: 'AL Central', primary: '#27251F', secondary: '#C4CED4' },
  { id: 114, name: 'Cleveland Guardians', abbr: 'CLE', espn: 'cle', division: 'AL Central', primary: '#00385D', secondary: '#E50022' },
  { id: 116, name: 'Detroit Tigers', abbr: 'DET', espn: 'det', division: 'AL Central', primary: '#0C2340', secondary: '#FA4616' },
  { id: 118, name: 'Kansas City Royals', abbr: 'KC', espn: 'kc', division: 'AL Central', primary: '#004687', secondary: '#BD9B60' },
  { id: 142, name: 'Minnesota Twins', abbr: 'MIN', espn: 'min', division: 'AL Central', primary: '#002B5C', secondary: '#D31145' },
  { id: 117, name: 'Houston Astros', abbr: 'HOU', espn: 'hou', division: 'AL West', primary: '#002D62', secondary: '#EB6E1F' },
  { id: 108, name: 'Los Angeles Angels', abbr: 'LAA', espn: 'laa', division: 'AL West', primary: '#BA0021', secondary: '#003263' },
  { id: 133, name: 'Oakland Athletics', abbr: 'OAK', espn: 'oak', division: 'AL West', primary: '#003831', secondary: '#EFB21E' },
  { id: 136, name: 'Seattle Mariners', abbr: 'SEA', espn: 'sea', division: 'AL West', primary: '#0C2C56', secondary: '#005C5C' },
  { id: 140, name: 'Texas Rangers', abbr: 'TEX', espn: 'tex', division: 'AL West', primary: '#003278', secondary: '#C0111F' },
  { id: 144, name: 'Atlanta Braves', abbr: 'ATL', espn: 'atl', division: 'NL East', primary: '#CE1141', secondary: '#13274F' },
  { id: 146, name: 'Miami Marlins', abbr: 'MIA', espn: 'mia', division: 'NL East', primary: '#00A3E0', secondary: '#EF3340' },
  { id: 121, name: 'New York Mets', abbr: 'NYM', espn: 'nym', division: 'NL East', primary: '#002D72', secondary: '#FF5910' },
  { id: 143, name: 'Philadelphia Phillies', abbr: 'PHI', espn: 'phi', division: 'NL East', primary: '#E81828', secondary: '#002D72' },
  { id: 120, name: 'Washington Nationals', abbr: 'WSH', espn: 'wsh', division: 'NL East', primary: '#AB0003', secondary: '#14225A' },
  { id: 112, name: 'Chicago Cubs', abbr: 'CHC', espn: 'chc', division: 'NL Central', primary: '#0E3386', secondary: '#CC3433' },
  { id: 113, name: 'Cincinnati Reds', abbr: 'CIN', espn: 'cin', division: 'NL Central', primary: '#C6011F', secondary: '#000000' },
  { id: 158, name: 'Milwaukee Brewers', abbr: 'MIL', espn: 'mil', division: 'NL Central', primary: '#FFC52F', secondary: '#12284B' },
  { id: 134, name: 'Pittsburgh Pirates', abbr: 'PIT', espn: 'pit', division: 'NL Central', primary: '#27251F', secondary: '#FDB827' },
  { id: 138, name: 'St. Louis Cardinals', abbr: 'STL', espn: 'stl', division: 'NL Central', primary: '#C41E3A', secondary: '#0C2340' },
  { id: 109, name: 'Arizona Diamondbacks', abbr: 'ARI', espn: 'ari', division: 'NL West', primary: '#A71930', secondary: '#E3D4AD' },
  { id: 115, name: 'Colorado Rockies', abbr: 'COL', espn: 'col', division: 'NL West', primary: '#333366', secondary: '#C4CED4' },
  { id: 119, name: 'Los Angeles Dodgers', abbr: 'LAD', espn: 'lad', division: 'NL West', primary: '#005A9C', secondary: '#EF3E42' },
  { id: 135, name: 'San Diego Padres', abbr: 'SD', espn: 'sd', division: 'NL West', primary: '#2F241D', secondary: '#FFC425' },
  { id: 137, name: 'San Francisco Giants', abbr: 'SF', espn: 'sf', division: 'NL West', primary: '#FD5A1E', secondary: '#27251F' },
]

export const getTeamById = (id) => TEAMS.find(t => t.id === Number(id))
export const teamLogo = (abbr) => {
  const team = TEAMS.find(t => t.abbr.toLowerCase() === (abbr || '').toLowerCase())
  const espnAbbr = team ? team.espn : (abbr || '').toLowerCase()
  return `https://a.espncdn.com/i/teamlogos/mlb/500/${espnAbbr}.png`
}
export default TEAMS
