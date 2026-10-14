---
title: "What 8N1 looks like on the wire"
description: "One UART byte, bit by bit: idle, start, eight data bits LSB first, stop."
date: 2026-10-13T16:24:43+03:00
draft: true
toc: false
---

Every UART config screen says "8N1", and most of us set it and move on.
Here is what it means when you put a logic analyzer on the TX pin.

## The frame

The line idles **high**. A byte goes out as ten bit-times:

1. **Start bit**: the line drops low for one bit-time. This falling edge is
   what the receiver syncs on.
2. **Eight data bits**, least significant bit first.
3. **No parity** (the "N").
4. **One stop bit**: the line goes high again (the "1").

Here is `'E'` (`0x45`, binary `0100 0101`) leaving the pin. Read LSB first,
the data bits come out as `1 0 1 0 0 0 1 0`:

![Logic trace of the byte 0x45 on a UART line](frame-0x45.svg "The character 'E' (0x45) in 8N1: start bit, data bits d0 to d7 least significant first, stop bit.")

## Timing

One bit-time is `1 / baud`. A frame is ten bit-times, so the useful byte rate
is the baud rate divided by ten[^1]:

| Baud    | Bit time  | Frame (10 bits) | Max bytes/s |
|---------|-----------|-----------------|-------------|
| 9600    | 104.17 µs | 1.042 ms        | 960         |
| 115200  | 8.68 µs   | 86.8 µs         | 11 520      |

## Sending it by hand

A bit-banged transmitter makes the frame obvious. This is a sketch for
illustration, not production code: real firmware uses the UART peripheral,
and a busy-wait delay is only accurate enough at low baud rates.

```c
#define BIT_US  104u   /* 9600 baud: 1 / 9600 s is about 104.17 us */

static void uart_tx_byte(uint8_t b)
{
    gpio_write(TX_PIN, 0);              /* start bit */
    delay_us(BIT_US);

    for (int i = 0; i < 8; i++) {       /* data bits, LSB first */
        gpio_write(TX_PIN, (b >> i) & 1u);
        delay_us(BIT_US);
    }

    gpio_write(TX_PIN, 1);              /* stop bit; line stays high = idle */
    delay_us(BIT_US);
}
```

The receiver does the mirror image: wait for the falling edge, move to the
middle of the start bit, then sample once per bit-time.

[^1]: This ignores any idle time between frames. Back-to-back frames hit this
    ceiling; real traffic usually has gaps.
