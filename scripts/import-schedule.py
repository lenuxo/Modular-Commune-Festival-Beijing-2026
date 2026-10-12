"""Import downloaded public official HTML; never infer unpublished end times.
Usage: python3 scripts/import-schedule.py /tmp/mc-performances.html /tmp/mc-workshops.html
"""
from html.parser import HTMLParser
from pathlib import Path
import json, re, sys, hashlib
class Tables(HTMLParser):
    def __init__(self):
        super().__init__(); self.heading=''; self.in_heading=False; self.tables=[]; self.rows=[]; self.row=None; self.cell=None; self.links=[]; self.cell_links=[]
    def handle_starttag(self,tag,attrs):
        if tag in ['h1','h2','h3','h4']: self.in_heading=True; self.heading=''
        if tag=='table': self.rows=[]; self.links=[]
        if tag=='tr': self.row=[]; self.row_links=[]
        if tag in ['td','th']: self.cell=''; self.cell_links=[]
        if tag=='br' and self.cell is not None: self.cell+=' / '
        if tag=='a' and self.cell is not None:
            href=dict(attrs).get('href','')
            if href.startswith('https://'): self.cell_links.append(href)
    def handle_endtag(self,tag):
        if tag in ['h1','h2','h3','h4']: self.in_heading=False
        if tag in ['td','th'] and self.cell is not None:
            if self.row is not None: self.row.append(' '.join(self.cell.split())); self.row_links.append(self.cell_links)
            self.cell=None
        if tag=='tr' and self.row is not None: self.rows.append(self.row); self.links.append(self.row_links); self.row=None
        if tag=='table': self.tables.append((self.heading,self.rows,self.links))
    def handle_data(self,data):
        if self.in_heading: self.heading+=data
        if self.cell is not None: self.cell+=data

def parse(path):
    p=Tables(); p.feed(Path(path).read_text()); return p.tables

def instant(day,time):
    h,m=map(int,time.split(':')); day+=1 if h<8 else 0
    return f'2026-10-{day:02d}T{h:02d}:{m:02d}:00+08:00'

def stable_id(*parts): return hashlib.sha256('|'.join(map(str,parts)).encode()).hexdigest()[:12]

events=[]
for heading,rows,links in parse(sys.argv[1]):
    match=re.search(r'10/(\d+)',heading)
    if not match: continue
    day=int(match[1]); party='Afterparty' in heading
    for i,row in enumerate(rows[1:]):
        if len(row)<4 or not re.fullmatch(r'\d{1,2}:\d{2}',row[0]): continue
        time,stage,title,origin=row[:4]
        events.append(dict(id=f'live-{day}-{stable_id(time,stage,title)}',title=title,kind='party' if party else 'live',day=day,start=instant(day,time),end=None,stage=stage,venue='factory' if 'Groundless' in stage else 'cube',presenter=title,origin=origin,price='入场规则待确认' if party else '普通音乐节免费',source='https://modularcommune.com/performances-2026/',booking=None,capacity=None,locationConfirmed=True,description=heading,artistId=f'artist-{stable_id(title)}',externalLinks=[url for cell in links[i+1] for url in cell]))
for heading,rows,links in parse(sys.argv[2]):
    for i,row in enumerate(rows[1:]):
        if heading=='DIY Workshops':
            if len(row)<7: continue
            ts=re.findall(r'\d{1,2}:\d{2}',row[0]); match=re.search(r'10/(\d+)',row[0])
            if not match or not ts: continue
            day=int(match[1]);title=row[2];presenter=row[5];kind='diy';venue='expo';stage='DIY Workshop · 二层';price=row[4].replace('RMB','元').replace('Free','免费');capacity=int(row[3]);booking=next(iter(links[i+1][-1]),None);end=instant(day,ts[1]) if len(ts)>1 else None;confirmed=True
        else:
            match=re.search(r'10/(\d+)',heading);ts=re.findall(r'\d{1,2}:\d{2}',row[0])
            if not match or not ts or 'Door open' in row[1]: continue
            day=int(match[1]);title=row[1];presenter=row[2];kind='master' if 'Master Class' in title or '大师课' in title else 'special' if 'Documentary' in title else 'talk';venue='cube' if kind=='master' else 'unknown';stage='大师课' if kind=='master' else '讲座 / 演示 · 地点待核实';price='¥200 / 场 · 通票 ¥500' if kind=='master' else '参与规则见官网';capacity=None;booking='https://modularcommune.com/master-class-2026/' if kind=='master' else None;end=instant(day,ts[1]) if len(ts)>1 else None;confirmed=kind=='master'
        events.append(dict(id=f'{kind}-{day}-{stable_id(ts[0],title)}',title=title,kind=kind,day=day,start=instant(day,ts[0]),end=end,stage=stage,venue=venue,presenter=presenter,origin='',price=price,source='https://modularcommune.com/workshops-2026/',booking=booking,capacity=capacity,locationConfirmed=confirmed,description='',artistId=None,externalLinks=[]))
events.sort(key=lambda e:(e['start'],e['stage'],e['id']))
Path('src/data/events.json').write_text(json.dumps(events,ensure_ascii=False,indent=2)+'\n')
print(f'Imported {len(events)} official scheduled events; {sum(e["end"] is not None for e in events)} published end times.')
