import React, { useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView 
} from 'react-native';
import { Send, Bot, User, Plus, CheckCircle } from 'lucide-react-native';

const BASE_URL = "http://127.0.0.1:8000";

export default function App() {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello Saghar! Click the (+) icon to upload any document (PDF, Word, Excel, CSV) or ask me anything directly.', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const flatListRef = useRef();

  // 📁 Web-native file picker triggered by the Plus (+) button
  const handlePickFile = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.txt,.docx,.xlsx,.xls,.csv';
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        await uploadFileToBackend(file);
      };
      input.click();
    } else {
      alert("Testing on Web Mode!");
    }
  };

  const uploadFileToBackend = async (file) => {
    setUploading(true);
    setUploadStatus(`Uploading: ${file.name}...`);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setUploadStatus(`Successfully indexed: ${file.name}`);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `📁 System Notice: I have processed and indexed your file "${file.name}". You can now ask questions about it!`,
          sender: 'bot'
        }]);
        // 3 seconds baad status banner auto-hide ho jaye
        setTimeout(() => setUploadStatus(''), 4000);
      } else {
        throw new Error(data.detail || "Upload failed");
      }
    } catch (error) {
      setUploadStatus('Upload failed.');
      alert(`Upload error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputText;
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuery }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: data.answer, sender: 'bot' }]);
      } else {
        throw new Error(data.detail || "Something went wrong");
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: `Error: ${error.message}`, sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header (Clean Layout) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DocuMind AI</Text>
      </View>

      {/* Dynamic Status Banner */}
      {uploadStatus ? (
        <View style={styles.statusBanner}>
          <ActivityIndicator size="small" color="#065F46" style={{ display: uploading ? 'flex' : 'none', marginRight: 6 }} />
          {!uploading && <CheckCircle size={14} color="#059669" />}
          <Text style={styles.statusText}>{uploadStatus}</Text>
        </View>
      ) : null}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.messageRow, item.sender === 'user' ? styles.userRow : styles.botRow]}>
            {item.sender === 'bot' && <Bot size={20} color="#4F46E5" style={styles.avatar} />}
            <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
              <Text style={[styles.messageText, item.sender === 'user' ? styles.userText : styles.botText]}>{item.text}</Text>
            </View>
            {item.sender === 'user' && <User size={20} color="#374151" style={styles.avatar} />}
          </View>
        )}
        contentContainerStyle={styles.chatContainer}
      />

      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text style={styles.loaderText}>Searching context & thinking...</Text>
        </View>
      )}

      {/* Gemini/ChatGPT Style Input Bar */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputAreaWrapper}>
          <View style={styles.inputBarContainer}>
            
            {/* ➕ Plus Icon Button inside the bar */}
            <TouchableOpacity 
              style={styles.plusButton} 
              onPress={handlePickFile} 
              disabled={uploading}
            >
              <Plus size={20} color="#6B7280" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Ask anything about the files..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            
            {/* Send Button inside/next to the bar */}
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
              <Send size={18} color="#FFF" />
            </TouchableOpacity>

          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', alignItems: 'center', marginTop: Platform.OS === 'android' ? 35 : 0 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  statusBanner: { flexDirection: 'row', backgroundColor: '#D1FAE5', padding: 10, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#A7F3D0' },
  statusText: { color: '#065F46', fontSize: 13, marginLeft: 6, fontWeight: '500' },
  chatContainer: { padding: 16 },
  messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end', maxWidth: '85%' },
  userRow: { alignSelf: 'flex-end' },
  botRow: { alignSelf: 'flex-start' },
  avatar: { marginHorizontal: 6, marginBottom: 4 },
  messageBubble: { padding: 12, borderRadius: 16, elevation: 1 },
  userBubble: { backgroundColor: '#4F46E5', borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  messageText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#FFF' },
  botText: { color: '#1F2937' },
  loaderContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8 },
  loaderText: { marginLeft: 8, color: '#6B7280', fontSize: 13 },
  
  // Custom Modern Input Bar Styling
  inputAreaWrapper: { padding: 14, backgroundColor: '#F9FAFB' },
  inputBarContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    alignItems: 'center', 
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  input: { 
    flex: 1, 
    minHeight: 36, 
    maxHeight: 120, 
    fontSize: 15, 
    color: '#1F2937', 
    paddingHorizontal: 4,
    outlineStyle: 'none' // Web par yellow border khatam karne ke liye
  },
  sendButton: { 
    backgroundColor: '#4F46E5', 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginLeft: 8
  }
});