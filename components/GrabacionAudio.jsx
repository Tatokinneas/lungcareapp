import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from "react-native";
import { Audio } from "expo-av";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import { LinearGradient } from "expo-linear-gradient";

let grabacion = new Audio.Recording();

const GrabacionAudio = ({ navigation }) => {
  const Reproductor = useRef(new Audio.Sound());

  const [RecordedURI, setRecordedURI] = useState("");

  const [isRecording, setIsRecording] = useState(false);

  const [tiempo, setTiempo] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);

  const [isAnimated, setIsAnimated] = useState(false);

  async function iniciarGrabacion() {
    try {
      setIsPlaying(true);
      console.log("Pidiendo permisos para grabar...");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log("Empezando a grabar...");

      await grabacion.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await grabacion.startAsync();
      console.log("grabacion iniciada");
      setIsRecording(true);
    } catch (error) {
      console.error("Error: No se pudo grabar", error);
    }
  }

  async function detenerGrabacion() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const status = await grabacion.getStatusAsync();
    if (status.isRecording === true) {
      try {
        await grabacion.stopAndUnloadAsync();
        const result = grabacion.getURI();
        setRecordedURI(result); // Here is the URI
        grabacion = new Audio.Recording();
        setIsRecording(false);
        console.log("Grabacion detenida");
        console.log("Fue grabado en :", result);
      } catch (error) {
        if (error.message.includes("Error: Grabacion no detenida")) {
          await grabacion._cleanupForUnloadedRecorder({
            canRecord: false,
            durationMillis: 0,
            isRecording: false,
            isDoneRecording: false,
          });
          console.log(`detenerGrabacion() error handler: ${error}`);
        } else if (
          error.message.includes(
            "Cannot unload a Recording that has already been unloaded."
          ) ||
          error.message.includes(
            "Error: Cannot unload a Recording that  has not been prepared."
          )
        ) {
          console.log(`detenerGrabacion() error handler: ${error}`);
        } else {
          console.log(`detenerGrabacion() error: ${error}`);
        }
      }
    }
  }

  const reproducirSonido = async () => {
    try {
      const result = await Reproductor.current.loadAsync(
        { uri: RecordedURI },
        {},
        true
      );

      const response = await Reproductor.current.getStatusAsync();
      if (response.isLoaded) {
        if (response.isPlaying === false) {
          Reproductor.current.playAsync();
          setIsPlaying(true);
          console.log("reproduciendo");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const detenerSonido = async () => {
    try {
      const checkLoading = await Reproductor.current.getStatusAsync();
      if (checkLoading.isLoaded === true) {
        await Reproductor.current.stopAsync();
        await Reproductor.current.unloadAsync();
        setIsPlaying(false);
        console.log("reproduccion detenida");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const revisarTiempo = (remainingTime) => {
    if (remainingTime === 0) {
      detenerGrabacion();
    }
  };

  return (
    <View style={styles.container}>
      <CountdownCircleTimer
        isPlaying={isPlaying}
        duration={tiempo}
        colors={[
          ["#cacaca", 0.5],
          ["#add8e6", 0.3],
          ["#6fbbd3", 0.2],
        ]}
      >
        {({ remainingTime, elapsedTime }) => (
          <Pressable>
            {revisarTiempo(remainingTime)}
            <LinearGradient
              colors={["#6fbbd3", "#add8e6"]}
              style={styles.linearGradient}
            >
              <Animated.Text style={styles.textStyle}>
                {remainingTime}
              </Animated.Text>
              <Text style={styles.secsStyle}>segundos</Text>
            </LinearGradient>
          </Pressable>
        )}
      </CountdownCircleTimer>
      <Pressable
        style={styles.boton}
        onPress={() => {
          iniciarGrabacion();
          setIsAnimated(true);
        }}
      >
        <Text style={styles.secsStyle}> Iniciar prueba </Text>
      </Pressable>
      <Pressable style={styles.boton} onPress={() => detenerGrabacion()}>
        <Text style={styles.secsStyle}> Dejar de Grabar </Text>
      </Pressable>
      <Pressable style={styles.boton} onPress={() => reproducirSonido()}>
        <Text style={styles.secsStyle}> Reproducir Sonido </Text>
      </Pressable>
      <Pressable style={styles.boton} onPress={() => detenerSonido()}>
        <Text style={styles.secsStyle}> Detener Sonido </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width * 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  boton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
    elevation: 5,
    backgroundColor: "#81d8d0",
    justifyContent: "space-around",
  },
  linearGradient: {
    width: 170,
    height: 170,
    borderRadius: 170 / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  textStyle: {
    fontSize: 40,
    color: "white",
  },
  secsStyle: {
    fontSize: 18,
    color: "white",
  },
});

export default GrabacionAudio;
