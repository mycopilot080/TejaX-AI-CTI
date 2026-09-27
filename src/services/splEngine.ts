import { SIEMLogEvent, SPLQueryResult } from '../types/cti';

export function executeSPLQuery(
  queryStr: string,
  allLogs: SIEMLogEvent[],
  timeRangeHours: number = 24
): SPLQueryResult {
  const startTime = Date.now() - timeRangeHours * 3600 * 1000;
  
  // Time filtering
  let logs = allLogs.filter((log) => {
    const logTime = new Date(log._time).getTime();
    return logTime >= startTime;
  });

  const startTimeMs = performance.now();
  const trimmed = queryStr.trim();

  // Split query by pipe character `|`
  const pipelineStages = trimmed.split('|').map((s) => s.trim()).filter(Boolean);

  let dataset: Record<string, any>[] = logs.map((l) => ({
    _time: l._time,
    _raw: l._raw,
    host: l.host,
    sourcetype: l.sourcetype,
    source: l.source,
    user: l.user || 'N/A',
    src_ip: l.src_ip || 'N/A',
    dest_ip: l.dest_ip || 'N/A',
    dest_port: l.dest_port || '',
    process_name: l.process_name || 'N/A',
    parent_process: l.parent_process || 'N/A',
    command_line: l.command_line || 'N/A',
    event_id: l.event_id || '',
    status: l.status || 'INFO',
    action: l.action || 'N/A',
    signature: l.signature || 'N/A',
    risk_score: l.risk_score || 0
  }));

  // Handle first search stage if no leading pipe or index search
  if (pipelineStages.length > 0) {
    const firstStage = pipelineStages[0];
    if (!firstStage.startsWith('stats') && !firstStage.startsWith('eval') && !firstStage.startsWith('table')) {
      dataset = filterSearchStage(dataset, firstStage);
      pipelineStages.shift();
    }
  }

  // Process subsequent pipeline stages
  for (const stage of pipelineStages) {
    if (stage.startsWith('search ')) {
      dataset = filterSearchStage(dataset, stage.replace(/^search\s+/, ''));
    } else if (stage.startsWith('where ')) {
      dataset = executeWhereStage(dataset, stage.replace(/^where\s+/, ''));
    } else if (stage.startsWith('stats ')) {
      dataset = executeStatsStage(dataset, stage.replace(/^stats\s+/, ''));
    } else if (stage.startsWith('table ')) {
      dataset = executeTableStage(dataset, stage.replace(/^table\s+/, ''));
    } else if (stage.startsWith('eval ')) {
      dataset = executeEvalStage(dataset, stage.replace(/^eval\s+/, ''));
    } else if (stage.startsWith('dedup ')) {
      dataset = executeDedupStage(dataset, stage.replace(/^dedup\s+/, ''));
    } else if (stage.startsWith('sort ')) {
      dataset = executeSortStage(dataset, stage.replace(/^sort\s+/, ''));
    } else if (stage.startsWith('top ')) {
      dataset = executeTopStage(dataset, stage.replace(/^top\s+/, ''));
    } else if (stage.startsWith('head ')) {
      dataset = executeHeadStage(dataset, stage.replace(/^head\s+/, ''));
    } else if (stage.startsWith('rare ')) {
      dataset = executeRareStage(dataset, stage.replace(/^rare\s+/, ''));
    }
  }

  const endTimeMs = performance.now();
  const executionTimeMs = Math.round((endTimeMs - startTimeMs) * 100) / 100;

  // Determine output columns
  let columns: string[] = [];
  if (dataset.length > 0) {
    columns = Object.keys(dataset[0]);
  } else {
    columns = ['_time', 'host', 'sourcetype', 'user', 'status', 'signature'];
  }

  // Generate histogram time buckets (6 buckets)
  const histogram = generateHistogram(logs);

  return {
    columns,
    rows: dataset,
    totalMatches: dataset.length,
    executionTimeMs,
    query: queryStr,
    histogram
  };
}

function filterSearchStage(data: Record<string, any>[], filterStr: string): Record<string, any>[] {
  if (!filterStr || filterStr === '*') return data;

  // Parse terms e.g. EventCode=10 or TargetImage="*lsass.exe*" or simple keywords
  const terms = filterStr.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

  return data.filter((row) => {
    return terms.every((term) => {
      let t = term.replace(/^"|"$/g, '');
      if (t.startsWith('index=') || t.startsWith('sourcetype=')) {
        if (t.startsWith('sourcetype=')) {
          const val = t.replace('sourcetype=', '').replace(/"/g, '').toLowerCase();
          return String(row.sourcetype || '').toLowerCase().includes(val);
        }
        return true; // Ignore index= for local simulation
      }

      if (t.includes('=')) {
        const [field, rawVal] = t.split('=');
        const cleanVal = rawVal.replace(/\*/g, '').replace(/"/g, '').toLowerCase();
        const rowVal = String(row[field] || '').toLowerCase();
        return rowVal.includes(cleanVal);
      }

      // Keyword search across all fields
      const searchVal = t.replace(/\*/g, '').toLowerCase();
      return (
        String(row._raw || '').toLowerCase().includes(searchVal) ||
        String(row.host || '').toLowerCase().includes(searchVal) ||
        String(row.user || '').toLowerCase().includes(searchVal) ||
        String(row.signature || '').toLowerCase().includes(searchVal) ||
        String(row.command_line || '').toLowerCase().includes(searchVal)
      );
    });
  });
}

function executeWhereStage(data: Record<string, any>[], exprStr: string): Record<string, any>[] {
  // Support `where count > 1` or `where risk_score >= 80`
  const match = exprStr.match(/(\w+)\s*(>|<|>=|<=|==|=)\s*(.+)/);
  if (!match) return data;

  const [, field, op, rawVal] = match;
  const numVal = Number(rawVal.replace(/"/g, ''));

  return data.filter((row) => {
    const val = Number(row[field]) || row[field];
    if (op === '>' || op === '>') return val > numVal;
    if (op === '<') return val < numVal;
    if (op === '>=') return val >= numVal;
    if (op === '<=') return val <= numVal;
    if (op === '==' || op === '=') return String(row[field]) === rawVal.replace(/"/g, '');
    return true;
  });
}

function executeStatsStage(data: Record<string, any>[], statsStr: string): Record<string, any>[] {
  // Parse e.g. `count by host, SourceImage` or `dc(user) as UniqueUsers count by src_ip`
  const bySplit = statsStr.split(/\s+by\s+/i);
  const funcPart = bySplit[0];
  const byPart = bySplit[1] || '';

  const groupFields = byPart ? byPart.split(',').map((f) => f.trim()) : [];

  const groups: Record<string, Record<string, any>[]> = {};

  data.forEach((row) => {
    const groupKey = groupFields.map((f) => String(row[f] || 'N/A')).join(' | ');
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(row);
  });

  const resultRows: Record<string, any>[] = [];

  Object.entries(groups).forEach(([key, rowList]) => {
    const summaryRow: Record<string, any> = {};

    if (groupFields.length > 0) {
      const keyParts = key.split(' | ');
      groupFields.forEach((f, idx) => {
        summaryRow[f] = keyParts[idx];
      });
    }

    if (funcPart.includes('dc(')) {
      const dcMatch = funcPart.match(/dc\((\w+)\)\s*(?:as\s+(\w+))?/i);
      if (dcMatch) {
        const targetField = dcMatch[1];
        const alias = dcMatch[2] || `dc(${targetField})`;
        const distincts = new Set(rowList.map((r) => r[targetField]));
        summaryRow[alias] = distincts.size;
      }
    }

    if (funcPart.includes('count')) {
      summaryRow['count'] = rowList.length;
    }

    if (funcPart.includes('avg(')) {
      const avgMatch = funcPart.match(/avg\((\w+)\)/i);
      if (avgMatch) {
        const field = avgMatch[1];
        const sum = rowList.reduce((acc, r) => acc + (Number(r[field]) || 0), 0);
        summaryRow[`avg(${field})`] = Math.round((sum / rowList.length) * 10) / 10;
      }
    }

    resultRows.push(summaryRow);
  });

  return resultRows;
}

function executeTableStage(data: Record<string, any>[], tableStr: string): Record<string, any>[] {
  const fields = tableStr.split(',').flatMap((s) => s.trim().split(/\s+/)).filter(Boolean);
  if (fields.length === 0) return data;

  return data.map((row) => {
    const newRow: Record<string, any> = {};
    fields.forEach((f) => {
      newRow[f] = row[f] !== undefined ? row[f] : 'N/A';
    });
    return newRow;
  });
}

function executeEvalStage(data: Record<string, any>[], evalStr: string): Record<string, any>[] {
  const [targetField, expr] = evalStr.split('=').map((s) => s.trim());
  if (!targetField || !expr) return data;

  return data.map((row) => ({
    ...row,
    [targetField]: expr.replace(/"/g, '')
  }));
}

function executeDedupStage(data: Record<string, any>[], dedupStr: string): Record<string, any>[] {
  const field = dedupStr.trim();
  const seen = new Set();
  return data.filter((row) => {
    const val = row[field];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

function executeSortStage(data: Record<string, any>[], sortStr: string): Record<string, any>[] {
  const isDesc = sortStr.startsWith('-');
  const field = sortStr.replace(/^[+-]/, '').trim();

  return [...data].sort((a, b) => {
    const valA = a[field] ?? '';
    const valB = b[field] ?? '';
    if (valA < valB) return isDesc ? 1 : -1;
    if (valA > valB) return isDesc ? -1 : 1;
    return 0;
  });
}

function executeTopStage(data: Record<string, any>[], topStr: string): Record<string, any>[] {
  const parts = topStr.split(/\s+/);
  let limit = 10;
  let field = parts[0];

  if (!isNaN(Number(parts[0]))) {
    limit = Number(parts[0]);
    field = parts[1];
  }

  const counts: Record<string, number> = {};
  data.forEach((row) => {
    const val = String(row[field] || 'N/A');
    counts[val] = (counts[val] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([val, count]) => ({
      [field]: val,
      count,
      percent: Math.round((count / data.length) * 1000) / 10
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function executeRareStage(data: Record<string, any>[], rareStr: string): Record<string, any>[] {
  const topResult = executeTopStage(data, rareStr);
  return topResult.reverse();
}

function executeHeadStage(data: Record<string, any>[], headStr: string): Record<string, any>[] {
  const limit = parseInt(headStr.trim(), 10) || 5;
  return data.slice(0, limit);
}

function generateHistogram(logs: SIEMLogEvent[]): { timeBucket: string; count: number }[] {
  const buckets: Record<string, number> = {};
  const now = Date.now();
  for (let i = 5; i >= 0; i--) {
    const t = new Date(now - i * 10 * 60 * 1000);
    const label = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    buckets[label] = 0;
  }

  logs.forEach((l) => {
    const t = new Date(l._time);
    const label = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (buckets[label] !== undefined) {
      buckets[label]++;
    } else {
      const keys = Object.keys(buckets);
      if (keys.length > 0) {
        buckets[keys[keys.length - 1]]++;
      }
    }
  });

  return Object.entries(buckets).map(([timeBucket, count]) => ({ timeBucket, count }));
}
