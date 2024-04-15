export const onRequest: PagesFunction = async () => {
    // Assuming 'squareblocksdb' is the binding name for your D1 database
    const READ_COUNTER_QUERY = 'SELECT counter FROM counter LIMIT 1;';
  
    try {
      const result = await squareblocksdb.execute(READ_COUNTER_QUERY);
      const counterValue = result.rows[0]?.counter ?? 'Counter not found';
      return new Response(counterValue.toString(), {
        headers: { 'Content-Type': 'text/plain' },
      });
    } catch (err) {
      console.error('Failed to read from D1 database:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
  };
  