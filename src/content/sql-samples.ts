import type { Dialect } from '@/components/SQLFormatter';

/** One idiomatic query per dialect; sql-utils.test.ts checks each formats on the full pass. */
export const sampleQueries: Record<Dialect, string> = {
  postgresql: `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= NOW() - INTERVAL '30 days' AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC NULLS LAST LIMIT 10;`,
  mysql: `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC LIMIT 10;`,
  mariadb: `select u.id, u.name, json_value(u.profile, '$.city') as city from users u where u.created_at >= now() - interval 30 day and u.status = 'active' order by u.name limit 10;`,
  transactsql: `SELECT TOP 10 u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= DATEADD(day, -30, GETDATE()) AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC;`,
  plsql: `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= SYSDATE - 30 AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC NULLS LAST FETCH FIRST 10 ROWS ONLY;`,
  sqlite: `select id, name, julianday('now') - julianday(created_at) as age_days from users where name like 'A%' and deleted_at is null order by age_days desc limit 10;`,
  bigquery: `SELECT u.id, u.name, COUNT(o.id) as order_count FROM \`project.dataset.users\` u LEFT JOIN \`project.dataset.orders\` o ON u.id = o.user_id WHERE u.created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY) GROUP BY u.id, u.name ORDER BY order_count DESC LIMIT 10;`,
  snowflake: `select user_id, event_type, event_ts from analytics.public.events where event_ts >= dateadd(day, -7, current_timestamp()) qualify row_number() over (partition by user_id order by event_ts desc) = 1;`,
  redshift: `select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where o.created_at >= getdate() - interval '30 days' group by u.id, u.name order by orders desc limit 10;`,
  db2: `select empno, lastname, salary from employee where workdept = 'D11' order by salary desc fetch first 5 rows only;`,
  spark: `select date_trunc('day', event_time) as day, count(distinct user_id) as dau from events where event_time >= date_sub(current_date(), 30) group by 1 order by 1;`,
  hive: `select dt, page, count(*) as views from page_views where dt between '2026-09-01' and '2026-09-30' group by dt, page order by views desc limit 20;`,
  trino: `select c.region, approx_distinct(o.customer_id) as customers from hive.sales.orders o join hive.sales.customers c on o.customer_id = c.id where o.order_date >= date '2026-01-01' group by c.region;`,
  duckdb: `select region, sum(amount) as total from read_csv_auto('sales.csv') group by all order by total desc;`,
  singlestoredb: `select id, name, count(*) over (partition by team_id) as team_size from users where active = 1 order by name limit 20;`,
  sql: `SELECT u.id, u.name, SUM(o.total) FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.id, u.name ORDER BY SUM(o.total) DESC;`,
};
