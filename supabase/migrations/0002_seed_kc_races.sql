-- Seed data for the Kansas City metro.
-- Dates and URLs below are approximate / annual-recurring and MUST be
-- verified against the official race site before any user-facing use.

insert into public.races
  (id, name, date, city, state, lat, lng, distances, elevation_gain_ft, difficulty_score, registration_url, description)
values
  ('kc-groundhog-run', 'Groundhog Run', '2027-01-31', 'Kansas City', 'MO', 39.0845, -94.5839,
   array['5k','10k'], 150, 35, 'https://groundhogrun.org',
   'Underground 5K/10K in the SubTropolis caves. Climate-controlled, mid-winter, benefits CCVI.'),

  ('kc-trolley-run', 'Trolley Run', '2027-04-25', 'Kansas City', 'MO', 39.0351, -94.5906,
   array['other'], 180, 25, 'https://trolleyrun.org',
   '4-mile point-to-point through Brookside and the Plaza, net downhill, benefits CCVI.'),

  ('kc-rock-the-parkway', 'Rock the Parkway', '2027-04-10', 'Kansas City', 'MO', 39.034, -94.5908,
   array['half','5k'], 420, 40, 'https://rocktheparkway.com',
   'Rolling half marathon through Brookside, Loose Park, and Ward Parkway.'),

  ('kc-brew-to-brew', 'Brew to Brew Relay', '2027-04-24', 'Kansas City', 'KS', 39.1142, -94.6275,
   array['other'], 1200, 60, 'https://brew2brew.com',
   '44-mile relay from Boulevard Brewing (KCMO) to Free State Brewing (Lawrence). Solo ultra option.'),

  ('kc-hospital-hill-run', 'Hospital Hill Run', '2027-06-05', 'Kansas City', 'MO', 39.0837, -94.5832,
   array['half','10k','5k'], 560, 55, 'https://hospitalhillrun.com',
   'KC''s oldest major race, since 1974. Named for the brutal climb up Hospital Hill.'),

  ('kc-independence-day-5k', 'KC Independence Day 5K', '2027-07-04', 'Kansas City', 'MO', 39.0997, -94.5786,
   array['5k'], 90, 20, '',
   'July 4th morning 5K near downtown.'),

  ('kc-plaza-10k', 'Plaza 10K', '2027-09-18', 'Kansas City', 'MO', 39.0414, -94.5905,
   array['10k'], 220, 35, '',
   'Fast loop around the Country Club Plaza.'),

  ('kc-garmin-marathon', 'Garmin Kansas City Marathon', '2027-10-16', 'Kansas City', 'MO', 39.1012, -94.5844,
   array['marathon','half','10k','5k'], 820, 55, 'https://www.kansascitymarathon.com',
   'The city''s flagship marathon weekend. Downtown, Westport, the Plaza, Loose Park.'),

  ('kc-longview-half', 'Longview Half Marathon', '2027-09-25', 'Lee''s Summit', 'MO', 38.9108, -94.4327,
   array['half','10k'], 480, 40, '',
   'Half around Longview Lake. Rolling, mostly shaded.'),

  ('kc-olathe-half', 'Olathe Half Marathon', '2027-05-02', 'Olathe', 'KS', 38.8814, -94.8191,
   array['half','10k','5k'], 360, 35, '',
   'Spring half through Olathe neighborhoods and parks.'),

  ('kc-pumpkin-trail-run', 'KC Pumpkin Trail Run', '2026-11-07', 'Kansas City', 'MO', 39.1012, -94.5844,
   array['5k','10k'], 220, 35, '',
   'Fall trail race, costumes encouraged.'),

  ('kc-turkey-trot', 'KC Turkey Trot', '2026-11-26', 'Kansas City', 'MO', 39.0997, -94.5786,
   array['5k','10k'], 100, 20, '',
   'Thanksgiving morning 5K/10K.'),

  ('kc-rudolph-run', 'Rudolph Run 5K', '2026-12-12', 'Kansas City', 'MO', 39.0414, -94.5905,
   array['5k'], 80, 20, '',
   'Holiday 5K through the Plaza lights.'),

  ('kc-waddell-reed-10k', 'Waddell & Reed 10K', '2027-03-20', 'Kansas City', 'MO', 39.0997, -94.5786,
   array['10k','5k'], 180, 30, '',
   'Early-spring 10K, flat and fast.'),

  ('kc-sprint-for-the-greens', 'Sprint for the Greens 5K', '2027-03-13', 'Overland Park', 'KS', 38.9822, -94.6708,
   array['5k'], 90, 20, '',
   'St. Patrick''s weekend 5K.')

on conflict (id) do nothing;
