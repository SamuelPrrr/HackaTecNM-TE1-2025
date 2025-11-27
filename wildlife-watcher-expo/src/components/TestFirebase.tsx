import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { db } from "../../services/firebase"; // tu archivo firebase.js
import { collection, getDocs } from "firebase/firestore";

type Item = {
  id: string;
  nombre?: string; // ajusta según tus campos
  [key: string]: any;
};

export default function TestFirebase() {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "data"));
        console.log("querySnapshot.size:", querySnapshot.size);
        const items: Item[] = [];
        const rawDocs: any[] = [];
        querySnapshot.forEach((doc) => {
          const d = doc.data();
          console.log("doc id:", doc.id, "data:", d);
          rawDocs.push({ id: doc.id, ...d });
          items.push({ id: doc.id, ...(d as Omit<Item, "id">) });
        });
        setRaw(rawDocs);
        setData(items);
      } catch (err: any) {
        console.log("Error al obtener datos:", err);
        setError(String(err?.message ?? err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prueba de Firebase</Text>

      {loading && <ActivityIndicator size="small" color="#333" />}

      {error ? (
        <Text style={styles.error}>Error: {error}</Text>
      ) : (
        <>
          <Text>Documentos: {data.length}</Text>

          <FlatList
            style={styles.list}
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.itemTitle}>{item.nombre ?? item.id}</Text>
                <Text style={styles.itemSub}>{JSON.stringify(item)}</Text>
              </View>
            )}
          />

          <Text style={styles.rawTitle}>JSON sin procesar (para depuración):</Text>
          <ScrollView style={styles.rawBox}>
            <Text selectable>{JSON.stringify(raw, null, 2)}</Text>
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  error: { color: "red", marginVertical: 8 },
  list: { maxHeight: 220, marginVertical: 8 },
  item: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#eee" },
  itemTitle: { fontWeight: "500" },
  itemSub: { color: "#444", fontSize: 12 },
  rawTitle: { marginTop: 12, fontWeight: "600" },
  rawBox: { maxHeight: 200, backgroundColor: "#fafafa", padding: 8, borderRadius: 6, marginTop: 6 },
});
