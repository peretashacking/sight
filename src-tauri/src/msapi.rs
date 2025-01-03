use std::io::{Read, Write, ErrorKind};
use std::time::Duration;
use std::net::{IpAddr, Ipv4Addr, SocketAddr, TcpStream};

const IPC_EXECUTE: u8 = 0;
const IPC_SETTING: u8 = 1;
const IPC_PING: u8 = 2;

pub struct MsApi {
    stream: TcpStream
}

impl MsApi {
    pub fn connect(port: u16) -> Result<MsApi, String> {
        let address = SocketAddr::new(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)), port);
        match TcpStream::connect_timeout(&address, Duration::from_millis(100)) {
            Ok(stream) => {
                stream.set_nodelay(true).expect("set_nodelay call failed");
                stream.set_read_timeout(Some(Duration::from_millis(100))).expect("set_read_timeout call failed");
                println!("Successfully connected on port {}", port);
                Ok(MsApi { stream })
            }
            Err(ref e) if e.kind() == ErrorKind::ConnectionRefused => {
                Err("ConnectionRefused".into())
            }
            Err(ref e) if e.kind() == ErrorKind::TimedOut => {
                Err("TimedOut".into())
            }
            Err(e) => {
                println!("ConnectionError: {} ({})", e.to_string(), e.kind());
                Err(e.to_string())
            }
        }
    }

    fn build_header(&self, msg_type: u8, payload_len: usize) -> Vec<u8> {
        let mut data = vec![0u8; 16 + payload_len];
        data[0] = msg_type;
        data[8..12].copy_from_slice(&(payload_len as u32).to_le_bytes());
        data
    }

    pub fn send_script(&mut self, script: String) -> Result<(), String> {
        let mut data = self.build_header(IPC_EXECUTE, script.len() + 1);
        data[16..16 + script.len()].copy_from_slice(script.as_bytes());

        match self.stream.write_all(&data) {
            Ok(_) => Ok(()),
            Err(_) => Err("NotInjected".into())
        }
    }

    pub fn send_setting(&mut self, key: String, value: String) -> Result<(), String> {
        let payload = format!("{} {}", key, value);
        let mut data = self.build_header(IPC_SETTING, payload.len() + 1);
        data[16..16 + payload.len()].copy_from_slice(payload.as_bytes());

        match self.stream.write_all(&data) {
            Ok(_) => Ok(()),
            Err(_) => Err("NotInjected".into())
        }
    }

    pub fn is_alive(&mut self) -> Result<bool, String> {
        let data = self.build_header(IPC_PING, 0);

        match self.stream.write_all(&data) {
            Ok(()) => {
                let mut buffer = vec![0u8];
                match self.stream.read(&mut buffer) {
                    Ok(_) => {
                        if buffer[0] == 0x10 {
                            Ok(true)
                        } else {
                            Ok(false)
                        }
                    }
                    Err(ref e) if e.kind() == ErrorKind::WouldBlock => {
                        println!("Found connection conflict on port {}; another client is already connected", self.stream.peer_addr().unwrap().port());
                        self.stream.shutdown(std::net::Shutdown::Both).expect("Failed to close socket");
                        Err("ConnectionConflict".into())
                    }
                    Err(e) => {
                        println!("ReadError: {} ({})", e.to_string(), e.kind());
                        Ok(false)
                    }
                }
            }
            Err(_) => Ok(false)
        }
    }
}